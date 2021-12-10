FROM node:16-alpine

WORKDIR /app

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY package.json ./

RUN npm install

COPY . /app/
CMD ["node", "/app/bin/www"]
