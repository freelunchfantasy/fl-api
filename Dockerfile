# Build stage
FROM node:18

# Set work directory
WORKDIR /usr/src/app

# Copy source
COPY . .

# Install dependencies
RUN npm install

# Export port
EXPOSE 3000

# Start command
CMD ["npm", "run", "deploy-prod"]