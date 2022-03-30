
FROM node:lts as base
RUN npm install -g truffle

FROM base as compile-stage
COPY . /app
WORKDIR /app
RUN apt update && apt install apache2 -y 
COPY entrypoint.sh /

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
