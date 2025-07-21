# Build stage
FROM node:22-slim AS builder
 
WORKDIR /usr/src/app

# Copy package files first to leverage layer caching
COPY package*.json ./
COPY turbo.json ./

# Copy all package.json files
COPY packages/server/package*.json ./packages/server/
COPY packages/web/package*.json ./packages/web/

# Copy tsconfig files
COPY tsconfig.json ./
COPY packages/server/tsconfig.json ./packages/server/
COPY packages/web/tsconfig.json ./packages/web/

# Install dependencies and build tools
RUN npm install && \
    npm install -g typescript next turbo

# Copy source code
COPY . .

# After copying files but before building
RUN npm run build
    

# Production stage
FROM node:22-slim

WORKDIR /usr/src/app

# Copy package files and configs
COPY package*.json ./
COPY turbo.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/web/package*.json ./packages/web/

# Install production dependencies and Playwright
RUN npm ci --omit=dev && \
    npm install -g next turbo cross-env && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y libxml2 && \ 
    DEBIAN_FRONTEND=noninteractive apt-get install -y fontconfig fontconfig-config libfontconfig1

# Copy built files from builder stage
COPY --from=builder /usr/src/app/packages/server/dist ./packages/server/dist
COPY --from=builder /usr/src/app/packages/web/.next ./packages/web/.next
COPY --from=builder /usr/src/app/packages/web/public ./packages/web/public

# Expose ports for both servers
EXPOSE 3000 3001

# Start both servers using turbo
CMD ["npm", "run", "start"]