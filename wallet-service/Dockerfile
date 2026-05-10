# Build context: repo root (docker build -f wallet-service/Dockerfile .)
# ssdk must be built first because wallet-service depends on file:../ssdk

FROM node:20-alpine AS builder
WORKDIR /repo

# 1. Build ssdk (shared SDK used by all services)
COPY ssdk/ ./ssdk/
RUN cd ssdk && npm install && npm run build

# 2. Build wallet-service
COPY wallet-service/ ./wallet-service/
RUN cd wallet-service && npm ci && npm run build && npm prune --omit=dev
# npm installs file: deps as symlinks; dereference so Node resolves transitive
# deps (tslib etc.) from /app/node_modules instead of the broken symlink target.
RUN SSDK=/repo/wallet-service/node_modules/@yapepay/service-ssdk && \
    if [ -L "$SSDK" ]; then cp -rL "$SSDK" /tmp/ssdk && rm "$SSDK" && mv /tmp/ssdk "$SSDK"; fi

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /repo/wallet-service/node_modules ./node_modules/
COPY --from=builder /repo/wallet-service/dist ./dist/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD nc -z localhost 3002 || exit 1

CMD ["/bin/sh", "-c", "node dist/db/migrate.js && exec node dist/index.js"]
