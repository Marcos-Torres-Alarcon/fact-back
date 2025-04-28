FROM node:20-slim AS build
WORKDIR /app
COPY package*.json .
RUN npm install --force
COPY . .
EXPOSE 3015
CMD [ "npm", "start" ]