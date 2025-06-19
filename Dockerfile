FROM node:18 AS frontend_builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production=false

COPY . .

RUN npm run build:vite:prod

FROM node:18-slim

WORKDIR /app

COPY package.json ./

RUN npm install --only=production

COPY server.js ./

COPY --from=frontend_builder /app/build ./build

EXPOSE 3000

CMD ["node", "server.js"]