FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .
RUN mkdir -p /var/lib/nessik/uploads /var/lib/nessik/backups \
    && chown -R node:node /var/lib/nessik

USER node
EXPOSE 3000
VOLUME ["/var/lib/nessik"]

CMD ["node", "server.js"]
