# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the Next.js app into the container
COPY . .

# Expose the port that Next.js will run on
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "run", "dev"]
