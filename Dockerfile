FROM node:8.0-alpine AS builder

# Installing all dependencies
RUN npm install

# Running tests
RUN make test
