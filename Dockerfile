FROM nitrojs/node-karma AS builder

WORKDIR /

# Installing all dependencies
RUN npm install

# Running tests
RUN make test
