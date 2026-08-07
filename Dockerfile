# Multi-stage production Dockerfile for MCP Car Aggregator Protocol
FROM node:20-alpine

# Install Python3, Pip, and build tools
RUN apk add --no-linux-headers --no-cache python3 py3-pip build-base

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Build TypeScript project
RUN npm run build

# Install Python Streamlit & AI Agent dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir streamlit google-genai requests python-dotenv

# Expose ports for Express Dashboard (4000) and Streamlit App (8501)
EXPOSE 4000
EXPOSE 8501

# Default command starts Express Dashboard Server
CMD ["npm", "run", "start:dashboard"]
