FROM node:20-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build         

FROM alpine AS export
WORKDIR /static
COPY --from=build /app/build .   

CMD ["sh", "-c", "echo 'frontend assets exported to /static'"]
