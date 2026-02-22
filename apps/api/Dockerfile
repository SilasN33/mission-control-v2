FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g pnpm@9

FROM base AS builder
WORKDIR /app

# Copy manifests only first (better layer caching)
COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install without frozen-lockfile to avoid lockfile mismatch
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN cd /app && npx prisma generate --schema ./prisma/schema.prisma

# Build TypeScript
RUN pnpm --filter @mission-control/api build

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
