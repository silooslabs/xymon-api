# Xymon API

RESTish HTTP proxy for interacting with Xymond.

A REST API that proxys HTTP requests in JSON (or other) format and forwards them
as a message to the Xymon daemon, returning a response in JSON or plain text.

Complete with Swagger documentation.

## Getting started
```
npm install
cp .env.example .env
# modify .env to point to xymon daemon
npm run start:debug
```

Visit http://localhost:8081/docs
