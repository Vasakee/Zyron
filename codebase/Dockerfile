FROM node:18-alpine as builder

ENV NODE_ENV=build
WORKDIR /home/node

COPY . /home/node

RUN corepack enable \
    && corepack prepare yarn@4.7.0 --activate \
    && yarn install --immutable

RUN yarn build

RUN yarn install --mode=skip-build

FROM node:18-alpine

ENV NODE_ENV=production
WORKDIR /home/node

# Copy the final artifacts from the builder stage
COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

USER node
CMD ["node", "dist/main.js"]