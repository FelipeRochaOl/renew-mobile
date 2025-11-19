import { useMemo } from 'react';
import { View, useColorScheme } from 'react-native';
// @ts-ignore - markdown lib no types export
import Markdown from 'react-native-markdown-display';
// @ts-ignore - syntax highlighter
import SyntaxHighlighter from 'react-native-syntax-highlighter';
// @ts-ignore
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/styles/hljs';

interface Props {
  content: string;
  streaming?: boolean;
  textColor?: string; // mantido para compat futura
  cursorColor?: string;
}

function useMarkdownStyles(scheme: 'light' | 'dark' | null | undefined): any {
  const dark = scheme === 'dark';
  return {
    body: { color: dark ? '#f8fafc' : '#111827', fontSize: 14, lineHeight: 20 },
    text: { color: dark ? '#f8fafc' : '#111827' },
    strong: { color: dark ? '#ffffff' : '#111827', fontWeight: '600' },
    em: { fontStyle: 'italic' },
    code_inline: {
      backgroundColor: dark ? '#1e293b' : '#f3f4f6',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'Menlo',
      fontSize: 13,
      color: dark ? '#e2e8f0' : '#1f2937'
    },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    heading1: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: dark ? '#ffffff' : '#0f172a' },
    heading2: { fontSize: 18, fontWeight: '600', marginBottom: 6, color: dark ? '#f1f5f9' : '#1e293b' },
    heading3: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: dark ? '#f1f5f9' : '#334155' },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: dark ? '#3b82f6' : '#2563eb',
      backgroundColor: dark ? '#1e3a8a40' : '#eff6ff',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 4,
      marginVertical: 6,
    },
    link: { color: dark ? '#60a5fa' : '#2563eb' },
  };
}

export default function MarkdownMessage({ content, streaming, cursorColor = '#6b7280' }: Props) {
  const scheme = useColorScheme();
  const styles = useMarkdownStyles(scheme as any);

  const rules = useMemo(() => ({
    fence: (node: any) => {
      const language = (node?.attrs?.class || '').replace('language-', '') || 'plaintext';
      return (
        <View key={node.key} style={{ marginVertical: 6 }}>
          <SyntaxHighlighter
            language={language}
            style={scheme === 'dark' ? atomOneDark : atomOneLight}
            highlighter="hljs"
            customStyle={{ borderRadius: 8, padding: 10 }}
          >
            {node.content}
          </SyntaxHighlighter>
        </View>
      );
    },
    code_block: (node: any) => {
      return (
        <View key={node.key} style={{ marginVertical: 6 }}>
          <SyntaxHighlighter
            language="plaintext"
            style={scheme === 'dark' ? atomOneDark : atomOneLight}
            highlighter="hljs"
            customStyle={{ borderRadius: 8, padding: 10 }}
          >
            {node.content}
          </SyntaxHighlighter>
        </View>
      );
    }
  }), [scheme]);

  return (
    <View>
      <Markdown style={styles} rules={rules}>{content}</Markdown>
      {streaming && (
        <Markdown style={{ body: { color: cursorColor, fontSize: 14 } }}>▌</Markdown>
      )}
    </View>
  );
}
