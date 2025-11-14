# Build stage
FROM node:20.11-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY tsconfig.json .
COPY vite.config.ts .
COPY src/ ./src/
COPY public/ ./public/
COPY index.html .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"] 