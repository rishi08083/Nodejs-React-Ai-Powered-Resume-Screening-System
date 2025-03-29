# Use Node.js as base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the backend listens on
EXPOSE 3000

# Run the application in production mode
CMD ["sh", "startup.sh"]