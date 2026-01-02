# Use an LTS Node runtime
FROM node:20-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Cloud Run listens on 8080 by default
ENV PORT=8080
EXPOSE 8080

# Start your server
CMD ["npm", "start"]
