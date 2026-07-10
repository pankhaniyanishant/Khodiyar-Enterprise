# syntax=docker/dockerfile:1.7

FROM node:24

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --progress=false

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
