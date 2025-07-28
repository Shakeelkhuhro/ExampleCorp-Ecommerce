# Backend Dockerfile (Node.js)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
