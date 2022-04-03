FROM node:17-alpine3.14

WORKDIR /app

COPY ./.env ./.env
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src

RUN yarn install
RUN yarn build

EXPOSE 3001

CMD [ "yarn", "start" ]
