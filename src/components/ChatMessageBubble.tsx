import { Text, View } from 'react-native';
import MarkdownMessage from './MarkdownMessage';

type Props = {
  text: string;
  from: 'user' | 'bot' | 'system';
  streaming?: boolean;
};

export default function ChatMessageBubble({ text, from, streaming }: Props) {
  const isUser = from === 'user';
  const isSystem = from === 'system';
  return (
    <View className={`flex-row my-1.5 px-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[80%] px-3 py-2 rounded-xl ${isUser
          ? 'bg-blue-500 rounded-tr-sm'
          : isSystem
            ? 'bg-yellow-100 border border-yellow-300 rounded-tl-sm'
            : 'bg-gray-100 rounded-tl-sm'
          }`}
      >
        {isUser ? (
          <Text className={isUser ? 'text-white' : 'text-gray-900'}>
            {text}
            {streaming && <Text className={isUser ? 'text-white' : 'text-gray-500'}>▌</Text>}
          </Text>
        ) : (
          <MarkdownMessage
            content={text}
            streaming={streaming}
            textColor={isSystem ? '#854d0e' : '#111827'}
            cursorColor={isSystem ? '#a16207' : '#6b7280'}
          />
        )}
      </View>
    </View>
  );
}
