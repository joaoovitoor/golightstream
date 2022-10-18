FROM inf1lightstreameus2.azurecr.io/joao-node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "app.js" ]