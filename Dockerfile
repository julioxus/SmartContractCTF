
FROM node:lts as base
RUN npm install -g truffle

FROM base as compile-stage
COPY . /app
WORKDIR /app
RUN apt update && apt install apache2 -y 
COPY entrypoint.sh /
#RUN /usr/local/bin/truffle compile
#RUN /usr/local/bin/truffle migrate --reset

#FROM httpd:bullseye
#COPY /app/src  /usr/local/apache2/htdocs/
#RUN /etc/init.d/apache2 start

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
