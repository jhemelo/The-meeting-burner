FROM node:20-slim

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy app files
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
