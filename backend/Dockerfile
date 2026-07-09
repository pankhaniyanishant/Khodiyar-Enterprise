FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --progress=false

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
