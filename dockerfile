FROM node:lts
WORKDIR /app
COPY package*.json app/
RUN npm install --production
COPY . .
CMD [ "node", "/bin/www" ]