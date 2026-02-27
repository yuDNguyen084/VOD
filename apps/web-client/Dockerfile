FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/web-client/package.json ./apps/web-client/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install --workspace=apps/web-client --workspace=packages/shared-types

# Build
COPY packages/shared-types ./packages/shared-types
COPY apps/web-client ./apps/web-client
RUN npm run build --workspace=apps/web-client

# Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/apps/web-client/.next/standalone ./
COPY --from=base /app/apps/web-client/.next/static ./apps/web-client/.next/static
COPY --from=base /app/apps/web-client/public ./apps/web-client/public

EXPOSE 3000
CMD ["node", "apps/web-client/server.js"]
