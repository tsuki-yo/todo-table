# Use official Node.js image as base
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Set environment variables
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
