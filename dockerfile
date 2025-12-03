# Use nginx as the base image
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy your website files into nginx public folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
