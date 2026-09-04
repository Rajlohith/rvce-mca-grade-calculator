# Small, production-ready nginx image
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
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY pages/ /usr/share/nginx/html/pages/
COPY icons/ /usr/share/nginx/html/icons/
COPY data/ /usr/share/nginx/html/data/
COPY docs/ /usr/share/nginx/html/docs/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]