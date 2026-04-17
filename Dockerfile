# --- Stage 1: Toolchain (Self-contained proto) ---
FROM debian:bookworm-slim AS toolchain
WORKDIR /app

# Install system dependencies for proto and node
RUN apt-get update && apt-get install -y \
    curl unzip xz-utils git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install proto inside the container
ENV PROTO_HOME="/root/.proto"
ENV PATH="$PROTO_HOME/shims:$PROTO_HOME/bin:$PATH"
RUN curl -fsSL https://moonrepo.dev/install/proto.sh | bash -s -- --yes

# Copy .prototools and install versions (Node 21.7.1, pnpm 8.15.5)
COPY .prototools ./
RUN proto install

# --- Stage 2: Dependencies ---
FROM toolchain AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# --- Stage 3: Build ---
FROM deps AS builder
WORKDIR /app

# Define Build Arguments (from src/env.ts)
# Note: Next.js validates these during build if env.ts is imported.
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ARG FLARESOLVERR_URL
ARG GEMINI_API_KEY
ARG NEXT_PUBLIC_SITE_URL

# Set Envs for the build process
ENV DATABASE_URL=$DATABASE_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV FLARESOLVERR_URL=$FLARESOLVERR_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY . .

# Build the application (Standalone mode)
RUN pnpm run build

# --- Stage 4: Runner ---
FROM node:21-slim AS runner
WORKDIR /app

# Runtime configuration
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Re-declare runtime envs (Builder args don't carry over to runner)
ENV DATABASE_URL=$DATABASE_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV FLARESOLVERR_URL=$FLARESOLVERR_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "/app/server.js"]
