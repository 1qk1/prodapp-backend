FROM node:16

ENV HOME=/home/app

COPY package.json package-lock.json $HOME/prodapp-backend/

WORKDIR $HOME/prodapp-backend

RUN npm install --silent --progress=false

COPY . $HOME/prodapp-backend

CMD ["npm", "start"]
