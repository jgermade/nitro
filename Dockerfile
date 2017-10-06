FROM nitrojs/node-karma AS builder

ADD ["package.json", "./"]
RUN npm install

ADD . ./

# Installing all dependencies
RUN npm install

# Running tests
RUN make test
