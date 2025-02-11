# Stage 1: Build the backend image
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3002
CMD ["node", "server.js"]

