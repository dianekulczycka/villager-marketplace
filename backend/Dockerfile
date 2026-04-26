FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD sh -c "sleep 10 && npx prisma db push && npm run start:dev"