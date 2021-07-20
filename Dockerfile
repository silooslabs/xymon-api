FROM node:16-alpine

WORKDIR /app

COPY package*.json .

RUN npm install --production --ignore-scripts

FROM node:16-alpine

USER node

ENV NODE_ENV=production

WORKDIR /app

COPY --from=0 /app/node_modules /app/node_modules
COPY . .

EXPOSE 8081

CMD ["node", "index.js"]
