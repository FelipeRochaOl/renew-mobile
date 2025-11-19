import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import {
  sendChatbotMessage,
  streamChatbotMessage,
} from "../services/api/client";

export type ChatMessage = {
  id: string;
  from: "user" | "bot" | "system";
  text: string;
  intent?: string;
};

const STORAGE_KEY = "chat_history_v1";

interface UseChatbotStreamOptions {
  token?: string;
  userId?: string;
  welcomeMessage?: string;
}

interface UseChatbotStreamResult {
  messages: ChatMessage[];
  isLoading: boolean;
  supportsStream: boolean;
  sendMessage: (content: string) => Promise<void>;
  cancel: () => void;
  clearHistory: () => Promise<void>;
}

export function useChatbotStream({
  token,
  userId,
  welcomeMessage = "Olá! Sou o mentor de IA do RenovarApp. Posso te ajudar a entender o futuro da sua profissão e sugerir caminhos de requalificação. Como você gostaria de começar?",
}: UseChatbotStreamOptions): UseChatbotStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supportsStream, setSupportsStream] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load history
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setMessages(JSON.parse(saved));
        } else {
          setMessages([{ id: "welcome", from: "bot", text: welcomeMessage }]);
        }
      } catch {
        setMessages([{ id: "welcome", from: "bot", text: welcomeMessage }]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [welcomeMessage]);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages, loaded]);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setMessages([{ id: "welcome", from: "bot", text: welcomeMessage }]);
  }, [welcomeMessage]);

  const finish = useCallback((intent?: string) => {
    setIsLoading(false);
    if (intent && intent !== "AI_REPLY") {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid.v4() as string,
          from: "system",
          text:
            intent === "QUOTA_EXCEEDED"
              ? "Limite de uso do modelo atingido. Posso continuar com orientações gerais, envie outra pergunta."
              : "Modelo indisponível. Usei fallback básico, tente novamente mais tarde.",
          intent,
        },
      ]);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const message = content.trim();
      if (!message || !token) return;
      // cancel previous
      abortRef.current?.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;
      setIsLoading(true);

      const userMsg: ChatMessage = {
        id: uuid.v4() as string,
        from: "user",
        text: message,
      };
      const botId = uuid.v4() as string;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: botId, from: "bot", text: "" },
      ]);

      const appendToken = (tokenPiece: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, text: m.text + tokenPiece } : m
          )
        );
      };

      const handleError = async () => {
        if (supportsStream) setSupportsStream(false);
        try {
          if (!userId) throw new Error("Usuário não autenticado");
          const res = await sendChatbotMessage(token, userId, message);
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: res.reply } : m))
          );
          finish(res.intent);
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? { ...m, text: "Ops, houve um erro. Tente novamente." }
                : m
            )
          );
          finish("FALLBACK");
        }
      };

      if (!supportsStream && userId && token) {
        try {
          const res = await sendChatbotMessage(token, userId, message);
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: res.reply } : m))
          );
          finish(res.intent);
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? { ...m, text: "Ops, houve um erro. Tente novamente." }
                : m
            )
          );
          finish("FALLBACK");
        }
        return;
      }

      if (!userId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  text: "Usuário não autenticado. Por favor, faça login.",
                }
              : m
          )
        );
        finish("FALLBACK");
        return;
      }

      streamChatbotMessage(token, userId, message, {
        onToken: appendToken,
        onDone: (intent) => finish(intent),
        onError: handleError,
        signal: abortController.signal,
      });
    },
    [token, userId, supportsStream, finish]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    supportsStream,
    sendMessage,
    cancel,
    clearHistory,
  };
}

export default useChatbotStream;
