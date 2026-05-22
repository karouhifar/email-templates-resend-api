# syntax=docker/dockerfile:1

# ---- Base ----
FROM oven/bun:1.2-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Install deps (prisma CLI is a prod dependency, so --production keeps it) ----
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# ---- Build: generate the Prisma client against prod node_modules ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy DATABASE_URL just to allow `prisma generate`. Real value injected at Lambda runtime.
ARG DATABASE_URL="postgres://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN bunx prisma generate

# ---- Final runtime image (AWS Lambda) ----
FROM base AS release
# Lambda Web Adapter MUST be in the final image — Lambda loads it as an extension at boot
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=build /app ./
USER bun
ENV PORT=3000
ENTRYPOINT ["bun", "run", "server.ts"]