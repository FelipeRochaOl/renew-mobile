FROM node:20-alpine

WORKDIR /usr/src/app

# Dependências nativas que às vezes o Expo pede
RUN apk add --no-cache bash git python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 19000 19001 19002

# Melhor para rodar em ambiente não-interativo (CI/Docker)
# - evita prompt do ngrok (sem --tunnel)
# - força modo não-interativo para não travar
# - usa localhost (ideal para simuladores)
ENV CI=1 \
  EXPO_NO_TELEMETRY=1 \
  CHOKIDAR_USEPOLLING=1 \
  WATCHPACK_POLLING=true

CMD ["npx", "expo", "start", "--localhost", "--non-interactive"]
