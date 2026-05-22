# syntax=docker/dockerfile:1

# ---- Base ----
FROM oven/bun:1.2-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Install deps (prisma CLI is a prod dependency, so --production keeps it) ----
FROM base AS deps
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# ---- Build: generate the Prisma client against prod node_modules ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy value for DATABASE_URL to allow Prisma Client generation. The actual value will be injected at Fly.io runtime.
ARG DATABASE_URL="postgres://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN bunx prisma generate

# ---- Final runtime image ----
FROM base AS release
ENV PORT=3000
COPY --from=build /app ./
USER bun
EXPOSE 3000
CMD ["bun", "run", "server.ts"]