FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install --production --build-from-source
COPY . /app/
CMD [ "node", "/app/bin/www" ]
