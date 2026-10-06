# ---- Stage 1: build ------------------------------------------------------
# Regenerates css/app.css and every js/**/*.min.js from the sources, so the
# image can never ship stale minified files if `npm run build` was forgotten.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY scripts/ scripts/
COPY css/ css/
COPY js/ js/
RUN npm run build

# ---- Stage 2: small, production-ready nginx image -------------------------
FROM nginx:alpine

# Remove nginx's default sample page/config
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy our own server config in
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static site itself in
# (everything nginx needs to serve — HTML, CSS, JS, icons, docs, etc.)
COPY index.html /usr/share/nginx/html/
COPY 404.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY manifest.webmanifest /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY apple-touch-icon.png /usr/share/nginx/html/
COPY --from=build /app/css/ /usr/share/nginx/html/css/
COPY --from=build /app/js/ /usr/share/nginx/html/js/
COPY pages/ /usr/share/nginx/html/pages/
COPY icons/ /usr/share/nginx/html/icons/
COPY data/ /usr/share/nginx/html/data/
COPY docs/ /usr/share/nginx/html/docs/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]