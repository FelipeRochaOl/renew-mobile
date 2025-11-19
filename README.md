# RenovarApp (Expo + TypeScript)

## Estrutura

- `App.tsx` (raiz): entrada padrão do Expo, reexporta `src/App`.
- `src/App.tsx`: bootstrap do app (Provider + NavigationContainer + Stack Navigator).
- `src/`: código da aplicação organizado por domínio
  - `navigation/`: `AppNavigator.tsx` (rotas do React Navigation)
  - `screens/`: telas (Welcome, Onboarding, ProfessionResult, LearningPaths, LearningPathDetail, Chatbot)
  - `components/`: componentes reutilizáveis (`PrimaryButton`, `ChatMessageBubble`)
  - `context/`: `UserContext` (guarda `userId` e perfil básico)
  - `services/api/`: `client.ts` (funções da API) + `types.ts` (tipos)

Observação: Removemos `expo-router` e a pasta `app/`. Toda a inicialização ocorre em `src/App.tsx`, mantendo a organização desejada em `src/`.

## API URL

- Configurada em `app.json` via `expo.extra.API_URL` (padrão: `http://localhost:3333`).
- Também aceita variáveis `EXPO_PUBLIC_API_URL` ou `API_URL` no ambiente de build/dev.

## Comandos

```zsh
# instalar deps
npm install

# iniciar app (Metro + Expo)
npm start
# em seguida: pressione i (iOS) ou a (Android)
```

### Rodando com Docker Compose (opcional)

No diretório raiz do monorepo:

```zsh
docker-compose up --build
```

- API: `http://localhost:3333`
- Expo DevTools: portas 19000/19001/19002

## Fluxo principal implementado

1. Welcome → Onboarding (cria usuário via `POST /users` e guarda `userId`).
2. ProfessionResult (avalia `POST /assessment/profession-risk`).
3. LearningPaths (lista/usa recomendadas) → LearningPathDetail.
4. Chatbot (streaming tokens via `POST /chatbot/message/stream` ou fallback para `POST /chatbot/message`).

OpenAI
# exporte sua chave antes (se quiser usar OpenAI)
export OPENAI_API_KEY=sk-...
docker compose up --build

## Streaming do Chatbot (SSE)
O app utiliza um hook de alto nível `useChatbotStream` para encapsular:
1. Streaming incremental (SSE) via `streamChatbotMessage`.
2. Fallback automático para chamada única se streaming falhar.
3. Persistência do histórico em AsyncStorage.
4. Mensagens de sistema para intents especiais (`QUOTA_EXCEEDED`, `FALLBACK`).

### Uso do Hook
Arquivo: `src/hooks/useChatbotStream.ts`
```ts
const { messages, isLoading, sendMessage, cancel, clearHistory } = useChatbotStream({
  token: authToken,
  userId: user.id,
  welcomeMessage: 'Bem-vindo...' // opcional
});

sendMessage('Qual o risco da profissão X?');
cancel();        // interrompe streaming
clearHistory();  // limpa histórico salvo
```

Cada item em `messages` tem `{ id, from: 'user' | 'bot' | 'system', text, intent? }`.
Enquanto tokens chegam, a bolha do bot exibe um cursor `▌`.

### Renderização Markdown das Respostas da IA
As respostas do mentor podem conter Markdown (listas, negrito, blocos de código). Para melhorar a visualização foi adicionado o pacote `react-native-markdown-display` e o componente `MarkdownMessage`.

Uso interno: `ChatMessageBubble` detecta mensagens do bot ou de sistema e renderiza via `MarkdownMessage`, aplicando estilos customizados (cores, blocos `code`, citações, títulos, links). Mensagens do usuário continuam texto puro.

Customização rápida:
- Ajuste estilos em `src/components/MarkdownMessage.tsx` (hook `useMarkdownStyles`).
- Tema escuro já suportado via `useColorScheme()` (cores dinâmicas).
- Realce de código com `react-native-syntax-highlighter` (temas Atom One Light/Dark). Linguagem detectada via fenced code blocks: ```js, ```ts, etc.

Se algum token parcial ainda estiver chegando (streaming), um cursor `▌` é exibido após o conteúdo renderizado.

Caso queira sanitizar links ou limitar HTML gerado, você pode interceptar o `content` antes de passar ao componente e remover padrões com regex.

### Código / Syntax Highlight
Para blocos de código, use fences markdown:
```ts
function exemplo(a: number): string {
  return `Valor: ${a}`;
}
```
O componente escolhe tema claro/escuro automaticamente. Para trocar estilos, altere import dos temas em `MarkdownMessage.tsx`.

### Estrutura Interna
`useChatbotStream` tenta streaming primeiro. Se ocorrer erro ou ambiente não suportar `ReadableStream`, marca `supportsStream=false` e passa a usar o endpoint não-stream nas próximas requisições.

### Observações
- Intent final `AI_REPLY` não gera mensagem de sistema; outras intents geram alerta amigável.
- Histórico persiste entre sessões (chave `chat_history_v1`).
- Botão "Limpar" remove todo histórico e recria mensagem de boas-vindas.
