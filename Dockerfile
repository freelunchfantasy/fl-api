# Build stage
FROM node:18

# Set work directory
WORKDIR /www

# Copy source to /www
COPY . /www

# Install dependencies
RUN npm install

# Start command
CMD ["npm", "run", "start"]