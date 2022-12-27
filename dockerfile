FROM node:16
WORKDIR /app

RUN apt-get update \
    && apt-get install -qq g++ build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libpango1.0-dev

COPY package.json ./

RUN npm install --build-from-source --production

COPY . /app/
CMD ["node", "/app/bin/www"]
