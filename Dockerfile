FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install curl -y

ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=14.20.0

RUN mkdir ${NVM_DIR}

RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN node -v

ADD . /todo
WORKDIR /todo

RUN npm install react@^16.13.1
RUN npm install browserslist@^4.21.0
#RUN npm install --global mozjpeg
RUN npm install

CMD ["npm", "run", "dev"]
