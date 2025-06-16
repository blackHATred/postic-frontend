# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY ./package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files to the working directory
COPY . .

# Build the application with Vite
RUN npm run build:vite:prod

# Expose port 3000 for the application
EXPOSE 3000

# Start the application using Vite preview mode
CMD [ "npm", "run", "preview" ]
