import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import ChatMessageBubble from '../components/ChatMessageBubble';
import { useUser } from '../context/UserContext';
import useChatbotStream, { ChatMessage } from '../hooks/useChatbotStream';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function ChatbotScreen() {
  const { user, authToken, hydrated } = useUser();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const effectiveUserId = user?._id || user?.id; // compatível com API que retorna _id
  const { messages, isLoading, sendMessage, cancel, clearHistory } = useChatbotStream({ token: authToken, userId: effectiveUserId });

  async function send() {
    const content = text.trim();
    if (!content) return;
    setText('');
    await clearHistory();
    await sendMessage(content);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#555' }}>Carregando dados...</Text>
      </View>
    );
  }

  if (!effectiveUserId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#333' }}>
          Você precisa estar autenticado para usar o chatbot.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        contentContainerStyle={{ paddingVertical: 12 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <ChatMessageBubble
            from={item.from}
            text={item.text}
            streaming={isLoading && item.from === 'bot' && item.text.length === 0}
          />
        )}
        ListFooterComponent={
          isLoading ? (
            <View style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <ActivityIndicator size="small" />
              <Text style={{ fontSize: 12, color: '#555' }}>Gerando resposta...</Text>
            </View>
          ) : null
        }
      />
      <View className="flex-row items-center p-2 gap-2">
        <Input
          className="flex-1"
          placeholder="Digite sua mensagem"
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Button title={isLoading ? '...' : 'Enviar'} onPress={send} disabled={isLoading || !effectiveUserId} />
        {isLoading && <Button title="Cancelar" onPress={cancel} />}
        {!isLoading && messages.length > 1 && (
          <Button title="Limpar" onPress={() => clearHistory()} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
