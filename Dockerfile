# syntax=docker/dockerfile:1

# ---- Base ----
FROM oven/bun:1.2-slim AS base
WORKDIR /app
ENV NODE_ENV=production
# Prisma's engine needs openssl at runtime; slim image lacks it
RUN apt-get update -y && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- Install deps (prisma CLI stays because it's a prod dependency) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- Build: generate the Prisma client against prod node_modules ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy DATABASE_URL only so `prisma generate` runs. Real value injected at runtime via fly secrets.
ARG DATABASE_URL="postgres://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN bunx prisma generate

# ---- Final runtime image (Fly.io persistent machine) ----
FROM base AS release
COPY --from=build /app ./

CMD ["bun", "run", "start"]