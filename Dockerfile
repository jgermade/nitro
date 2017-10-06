FROM nitrojs/node-karma AS builder

# Installing all dependencies
RUN npm install

# Running tests
RUN make test
