# ===============================================
# Stage 1: Builder
# ===============================================
# This stage installs all dependencies, builds the app,
# and generates the Prisma client.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (dev + prod) for building
# We use 'ci' for reproducible builds in CI
RUN npm ci --include=dev

# Copy the rest of the source code (src, prisma, tsconfig.json, etc.)
COPY . .

# Generate Prisma Client (uses devDependencies)
RUN npx prisma generate

# Build TypeScript code (uses devDependencies)
RUN npm run build

# --- This is the key optimization ---
# After building, remove devDependencies to create a
# lean, production-only node_modules folder.
RUN npm prune --production

# ===============================================
# Stage 2: Production
# ===============================================
# This stage creates the final, minimal, and secure image.
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4001

# Copy package files (good for metadata)
COPY package.json package-lock.json ./

# Copy only the pruned (production) node_modules from the builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application code
COPY --from=builder /app/dist ./dist

# Copy Prisma schema (needed by Prisma client at runtime)
COPY --from=builder /app/prisma ./prisma

# Expose application port
EXPOSE 4001

# Start the application
CMD ["node", "dist/src/index.js"]