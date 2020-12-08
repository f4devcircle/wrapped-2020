FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . /app/
CMD [ "node", "/app/bin/www" ]