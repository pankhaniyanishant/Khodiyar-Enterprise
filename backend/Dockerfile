FROM node:24

WORKDIR /app

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
