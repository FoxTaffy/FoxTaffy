FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY index.js .
EXPOSE 3002
CMD ["node", "index.js"]
