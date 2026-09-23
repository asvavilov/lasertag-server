# lasertag-server bot — build & runtime image
# Layout mirrors the original: app at /app/repo, .ssl one level above (code reads ../../.ssl from dist/).

FROM node:24-alpine AS build
WORKDIR /app/repo
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app/repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/repo/dist ./dist
# readLog() requires this file to exist next to dist/
COPY bot-geo.log ./bot-geo.log
EXPOSE 9443
CMD ["node", "dist/index.js"]
