# --- Stage 1: Build the React App ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:stable-alpine
# Copy the built files from Stage 1 to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# We need a custom Nginx config for React Router to work
# (We will create this file in the next step)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]