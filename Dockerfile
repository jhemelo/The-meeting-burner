# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the Vite site to /app/dist
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Only production deps for runtime (Express)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server + built dist + public
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 8080
CMD ["npm", "start"]
