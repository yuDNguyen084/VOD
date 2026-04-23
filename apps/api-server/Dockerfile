FROM node:18-bullseye-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

# 1. Copy only package.json files first to leverage Docker layer caching
COPY package.json package-lock.json* ./
COPY apps/api-server/package.json ./apps/api-server/
COPY packages/database/package.json ./packages/database/
COPY packages/shared-types/package.json ./packages/shared-types/

# 2. Install dependencies only for the api-server and its local packages
RUN npm install --workspace=apps/api-server --workspace=packages/database --workspace=packages/shared-types

# 3. Copy only the necessary source code (excluding web-client, media-worker, etc.)
COPY packages/database ./packages/database
COPY packages/shared-types ./packages/shared-types
COPY apps/api-server ./apps/api-server

# 4. Generate Prisma & Build dependencies
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build the shared-types package first so that api-server can use the compiled types/logic
RUN npm run build --workspace=packages/shared-types

WORKDIR /app/apps/api-server

RUN npm run build

EXPOSE 4000
ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]