FROM node:latest

WORKDIR /omnidroid

COPY . .

RUN rm -rf node_modules
RUN npm i

CMD ["npm", "start"]
# CMD ["npm", "run", "dev"]