# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Next.js project
RUN npm run build

# Expose the port Next.js serves on
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "run", "start"]
