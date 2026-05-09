# Build context: repo root (docker build -f wallet-service/Dockerfile .)
# ssdk must be built first because wallet-service depends on file:../ssdk

FROM node:20-alpine AS builder
WORKDIR /repo

# 1. Build ssdk (shared SDK used by all services)
COPY ssdk/ ./ssdk/
RUN cd ssdk && npm ci && npm run build

# 2. Build wallet-service
COPY wallet-service/ ./wallet-service/
RUN cd wallet-service && npm ci && npm run build && npm prune --omit=dev

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Copy pruned node_modules (includes resolved ssdk) and compiled output
COPY --from=builder /repo/wallet-service/node_modules ./node_modules/
COPY --from=builder /repo/wallet-service/dist ./dist/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD nc -z localhost 3002 || exit 1

CMD ["node", "dist/index.js"]
