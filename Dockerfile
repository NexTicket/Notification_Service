# Development Dockerfile with hot-reload support

FROM node:20-alpine

# Install development tools
RUN apk add --no-cache bash git

# Set working directory
WORKDIR /app

# Set NODE_ENV to development
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose the application port
EXPOSE 4001

# Start the application with hot-reload using tsx watch
CMD ["npm", "run", "dev"]
