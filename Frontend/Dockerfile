# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the frontend for production
RUN npm run build

# Expose the port that the app will run on
EXPOSE 3000

# Start the frontend server in production mode
CMD ["npm", "start"]
