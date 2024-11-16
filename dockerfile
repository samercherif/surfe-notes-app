FROM node:20.11.1 as build-stage
WORKDIR /app
COPY package.json .yarnrc.yml .pnp.cjs yarn.lock ./
COPY .yarn ./.yarn
COPY . .

FROM nginx:stable-alpine as production-stage
COPY run.sh /run.sh
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["/bin/sh","/run.sh"]
