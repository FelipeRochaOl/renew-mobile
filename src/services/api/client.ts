import Constants from "expo-constants";
import {
  LearningPath,
  ProfessionRisk,
  RecommendationsForUserResponse,
  User,
} from "./types";
// Minimal declaration to silence TS in React Native (no Node types)
declare const process: any;

export const API_URL: string =
  ((Constants.expoConfig?.extra as any)?.API_URL as string) ||
  (process.env.EXPO_PUBLIC_API_URL as string) ||
  (process.env.API_URL as string) ||
  "http://localhost:3333";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  return http<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function createUser(
  payload: Omit<User, "id" | "_id">
): Promise<User> {
  return http<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: string,
  token: string,
  payload: Partial<User>
): Promise<User> {
  return http<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function assessProfessionRisk(
  token: string,
  body: {
    userId?: string;
    profession: string;
    region?: string;
  }
): Promise<ProfessionRisk> {
  return http<ProfessionRisk>("/assessment/profession-risk", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getRecommendationsForUser(
  token: string,
  userId: string
): Promise<RecommendationsForUserResponse> {
  return http<RecommendationsForUserResponse>(
    `/recommendations/for-user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function getLearningPaths(
  token: string,
  params?: {
    targetProfession?: string;
    forCurrentProfession?: boolean;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }
): Promise<LearningPath[]> {
  const query = new URLSearchParams();
  if (params?.targetProfession)
    query.append("targetProfession", params.targetProfession);
  if (params?.forCurrentProfession !== undefined)
    query.append("forCurrentProfession", String(params.forCurrentProfession));
  if (params?.level) query.append("level", params.level);
  const qs = query.toString();
  return http<LearningPath[]>(`/learning-paths${qs ? `?${qs}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getLearningPath(
  token: string,
  id: string
): Promise<LearningPath> {
  return http<LearningPath>(`/learning-paths/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function sendChatbotMessage(
  token: string,
  userId: string,
  message: string
): Promise<{ reply: string; intent: string; data?: any }> {
  return http<{ reply: string; intent: string; data?: any }>(
    `/chatbot/message`,
    {
      method: "POST",
      body: JSON.stringify({ userId, message }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function streamChatbotMessage(
  token: string,
  userId: string,
  message: string,
  handlers: {
    onToken: (token: string) => void;
    onDone: (intent?: string) => void;
    onError: (err: any) => void;
    signal?: AbortSignal;
  }
) {
  const supportsReadable =
    typeof (globalThis as any).ReadableStream !== "undefined";

  const fetchStream = async () => {
    const res = await fetch(`${API_URL}/chatbot/message/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, message }),
      signal: handlers.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const body: any = (res as any).body;
    const getReader = body?.getReader?.bind(body);
    if (!body || typeof getReader !== "function") {
      throw new Error("NO_STREAM_SUPPORT");
    }
    const reader = getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\n\n/);
      buffer = events.pop() || "";
      for (const evt of events) {
        if (!evt.trim()) continue;
        const dataLine = evt.split(/\n/).find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const jsonStr = dataLine.replace(/^data:\s*/, "");
        try {
          const obj = JSON.parse(jsonStr);
          if (obj.token) handlers.onToken(obj.token);
          if (obj.reply && !obj.token) handlers.onToken(obj.reply);
          if (obj.done) handlers.onDone(obj.intent);
          if (obj.error && !obj.token) handlers.onError(obj.error);
        } catch {}
      }
    }
  };

  const eventSourceStream = async () => {
    const url = `${API_URL}/chatbot/message/stream?message=${encodeURIComponent(
      message
    )}${userId ? `&userId=${encodeURIComponent(userId)}` : ""}`;
    const ES: any = (globalThis as any).EventSource;
    if (!ES) throw new Error("EventSourceUnavailable");
    return new Promise<void>((resolve, reject) => {
      const es = new ES(url);
      const abortListener = () => {
        es.close();
        resolve();
      };
      handlers.signal?.addEventListener("abort", abortListener);
      es.onmessage = (evt: any) => {
        try {
          const obj = JSON.parse(evt.data);
          if (obj.token) handlers.onToken(obj.token);
          if (obj.reply && !obj.token) handlers.onToken(obj.reply);
          if (obj.done) {
            handlers.onDone(obj.intent);
            es.close();
            resolve();
          }
          if (obj.error && !obj.token) handlers.onError(obj.error);
        } catch {}
      };
      es.onerror = () => {
        es.close();
        reject(new Error("EventSourceError"));
      };
    });
  };

  try {
    if (supportsReadable) {
      try {
        await fetchStream();
        return;
      } catch (e: any) {
        if (e?.message !== "NO_STREAM_SUPPORT") throw e;
      }
    }
    await eventSourceStream();
  } catch (err: any) {
    if (err?.name === "AbortError") return;
    handlers.onError(err);
  }
}
