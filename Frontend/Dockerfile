# Use an official Node.js image as the base
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js app (now uses the correct environment variables)
RUN npm run build

# Use a smaller production image to serve the built app
FROM node:22-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copy environment variables
COPY --from=builder /app/.env ./.env

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server
CMD ["npm","start"]
