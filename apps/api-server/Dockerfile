FROM node:18-bullseye-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

COPY . .

RUN npm install

RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

WORKDIR /app/apps/api-server

RUN npm run build

EXPOSE 4000
ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]