# 1. BUILD STAGE
# This stage compiles TypeScript to JavaScript
FROM node:20-alpine AS build

# Arbeitsverzeichnis im Container
WORKDIR /app

# package.json + tsconfig.json kopieren (reicht für npm install)
COPY package.json ./
COPY tsconfig.json ./
COPY jest.config.js ./

# Install dependencies (including dev dependencies, because we still need to build here)
RUN npm install

# Copy the remaining code
COPY src ./src
COPY migrations ./migrations
# COPY .env ./.env

# Run testcases
# RUN npm run test
# COPY db ./db

# Build TypeScript to dist/
RUN npm run build


# 2. RUNTIME STAGE
# This stage contains ONLY what we really need at runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install only production dependencies (no more TypeScript, no ts-node-dev)
RUN npm install --omit=dev

# Copy the built code from the first stage
COPY --from=build /app/dist ./dist

# Port on which the server will run
ENV PORT=3001
EXPOSE 3001

# Start command for the API
CMD ["node", "dist/src/server.js"] 