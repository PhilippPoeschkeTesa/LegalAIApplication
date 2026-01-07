# Stage 1: Build the React/Vite App
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lockfiles first (caching for npm install)
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Accept VITE_ build args and inject them into .env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the app
RUN npm run build

# Stage 2: Serve via nginx (static web server)
FROM nginx:alpine AS runtime

# Remove default nginx website config and add our own
# (By default, nginx listens on port 80)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from Stage 1 to /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
