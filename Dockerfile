FROM ubuntu:focal

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl ffmpeg && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/app

# Copy application files
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]