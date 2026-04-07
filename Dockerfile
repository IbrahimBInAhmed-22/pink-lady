FROM node:22-bookworm-slim

# Prisma needs OpenSSL for generate and the query engine at runtime
RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

RUN npx prisma generate

# Apply migrations at image build when DATABASE_URL is available (pass as Docker build-arg on CI/Railway).
# Runtime no longer runs migrate — avoids slow/failed container start when DB is unreachable at boot.
ARG DATABASE_URL
RUN if [ -n "$DATABASE_URL" ]; then npx prisma migrate deploy; \
    else echo "Skipping prisma migrate deploy: pass DATABASE_URL as a build-arg to apply migrations in the image."; \
    fi

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
