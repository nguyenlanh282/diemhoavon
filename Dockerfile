# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci && npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:22-alpine AS runner

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package files for production install
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Generate Prisma client in production
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check disabled for debugging
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
