# Build context: repo root (docker build -f transaction-service/Dockerfile .)
# ssdk must be built first because transaction-service depends on file:../ssdk

FROM node:20-alpine AS builder
WORKDIR /repo

# 1. Build ssdk (shared SDK used by all services)
COPY ssdk/ ./ssdk/
RUN cd ssdk && npm install && npm run build

# 2. Build transaction-service
COPY transaction-service/ ./transaction-service/
RUN cd transaction-service && npm ci && npm run build && npm prune --omit=dev
# npm installs file: deps as symlinks; dereference so Node resolves transitive
# deps (tslib etc.) from /app/node_modules instead of the broken symlink target.
RUN SSDK=/repo/transaction-service/node_modules/@yapepay/service-ssdk && \
    if [ -L "$SSDK" ]; then cp -rL "$SSDK" /tmp/ssdk && rm "$SSDK" && mv /tmp/ssdk "$SSDK"; fi

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

COPY --from=builder /repo/transaction-service/node_modules ./node_modules/
COPY --from=builder /repo/transaction-service/dist ./dist/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD nc -z localhost 3003 || exit 1

CMD ["/bin/sh", "-c", "node dist/db/migrate.js && exec node dist/index.js"]
