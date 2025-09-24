# Build stage for React app
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy server files
COPY package*.json ./
RUN npm ci --only=production

COPY server/ ./server/
COPY --from=client-build /app/client/build ./client/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 5000

CMD ["node", "server/index.js"]