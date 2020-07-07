FROM node:carbon
MAINTAINER HANGYU CHO
# making workspace
RUN mkdir -p /app
# set workspace
WORKDIR /app
# transfer files from local to dockerDir
ADD ./ /app
# install lib
RUN npm install
# deploy version
ENV NODE_ENV=production
# run node
CMD node app.js