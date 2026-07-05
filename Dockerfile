FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies like typescript)
RUN npm install

# Copy all source files
COPY . .

# Build the TypeScript project
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled dist folder from builder stage
COPY --from=builder /app/dist ./dist

# Copy the frontend static assets (so the test chat works in production)
COPY public/ ./public/

# Expose port (default 5000)
EXPOSE 5059

# Start the server
CMD ["npm", "start"]
