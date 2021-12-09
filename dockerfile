FROM node:lts
RUN sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
WORKDIR /app
COPY package*.json ./
RUN npm install --production --build-from-source
COPY . /app/
CMD [ "node", "/app/bin/www" ]
