# express-api-server

An opinionated Web API server library using Express, Node.js, and REST best practices.

[![Build Status](https://travis-ci.org/cgmartin/express-api-server.svg?branch=master)](https://travis-ci.org/cgmartin/express-api-server)
[![Dependency Status](https://david-dm.org/cgmartin/express-api-server.svg)](https://david-dm.org/cgmartin/express-api-server)
[![npm version](https://badge.fury.io/js/express-api-server.svg)](http://badge.fury.io/js/express-api-server)

## Synopsis

The express-api-server is meant as a reusable web API server with built-in security, error handling,
and logging. Focus on writing just your custom API routes and leave rest of the server set up to this library.

This web API server project is meant to accompany a [SPA client](https://github.com/cgmartin/angular-spa-browserify-example)
as part of a set of Node.js microservices (Static Web Server, Web API Server, Chat Server, Reverse Proxy).
It is designed with portability and scalability in mind (see [Twelve Factors](http://12factor.net/)).

Configuration options are passed in by the consumer or via environment variables at runtime.

## Quick Start / Usage

```bash
$ npm install express-api-server --save
```

Create a `server.js` wrapper script, passing in the configuration options that apply for your app:
```js
// server.js : Web API Server entrypoint
var apiServer = require('express-api-server');

var options = {
    baseUrlPath: '/api',
    cors: {},
    sslKeyFile:  './keys/my-domain.key'),
    sslCertFile: './keys/my-domain.cert')
};

var initRoutes = function(app, options) {
    // Set up routes off of base URL path
    app.use(options.baseUrlPath, [
        require('./todo-routes')
    ]);
};

apiServer.start(initRoutes, options);
```

An example express router for "todo" resources:
```js
// todo-routes.js
var express = require('express');
var errors = require('express-api-server').errors;
var jsonParser = require('body-parser').json();

var router = module.exports = express.Router();

router.route('/todos')
    // GET /todos
    .get(function(req, res, next) {
        var todos; // ...Get resources from backend...
        res.json(todos);
    })
    // POST /todos
    .post(jsonParser, function(req, res, next) {
        if (!req.body) { return next(new errors.BadRequestError()); }

        // Validate JSON body using whatever method you choose
        var newTodo = filter(req.body);
        if (!validate(newTodo)) {
            req.log.error('Invalid todo body'); // Bunyan logger available on req
            return next(new errors.UnprocessableEntityError('Invalid todo resource body', {errors: validate.errors}));
        }

        // ...Save to backend...

        res.location(req.protocol + '://' + req.get('Host') + req.baseUrl + '/todos/' + newTodo.id);
        res.status(201); // Created
        res.json(newTodo);
    });
```

Run your `server.js` with optional runtime environment variables:
```bash
$ API_COMPRESSION=1 API_SSL=1 API_PORT=4443 node server.js
```

See [src/config.js](src/config.js) for a full list of the available configuration options.

See [src/lib/errors.js](src/lib/errors.js) for several built-in Error sub-types appropriate for API scenarios.

See [example/server.js](example/server.js) for a runnable example.

### Default Environment Variables

* `API_WEBROOT` : Path to the web root directory.
* `API_COMPRESSION` : Enables gzip compression when set to "1".
* `API_GRACEFUL_SHUTDOWN` : Wait for connections to close before stopping server when set to "1".
* `API_SESSION_MAXAGE` : The time in ms until the session ID cookie should expire (default: 2 hours). This is just a tracking cookie, no session storage is used here.
* `API_REV_PROXY` : The server is behind a reverse proxy when set to "1".
* `API_PORT` : The port to run on (default: 8000).
* `API_SSL` : Use a HTTPS server when set to "1". Enforces HTTPS by redirecting HTTP users when used with a reverse HTTP/HTTPS proxy.
* `API_SSL_KEY` : Path to the SSL key file.
* `API_SSL_CERT` : Path to the SSL cert file.

## Features

* **Security headers** using [Helmet](https://github.com/helmetjs/helmet) middleware.
* **Correlation IDs**: Creates unique request and "conversation" ids. Useful for tracking requests from client to backend services.
* **Graceful shutdown**: Listens for SIGTERM/SIGINT and unhandled exceptions, and waits for open connections to complete before exiting.
* **JSON format access logs**: Great for log analysis and collectors such as Splunk, Fluentd, Graylog, Logstash, etc.
* **Enforce HTTPS**: Redirects users from HTTP urls to HTTPS.
* **API Error Types**: Conveniently create errors for bad, unauthorized, or unprocessable requests.
* **Error Handler**: API Errors fall through to the built-in error handler to send standard error responses with custom error codes, headers, and validation field errors.
* **Pretty Print**: Format your JSON reponses using `?pretty=true` query param on any endpoint.

## Contributing

1. Install [Node.js](https://nodejs.org/download/)
1. Install Gulp: `npm -g i gulp`
1. Clone this repo
1. Install dependencies: `npm i`
1. Start the app in dev mode: `npm start`
1. Point browser to <http://localhost:3000/> and watch the console for server logs

After installation, the following actions are available:

* `npm start` : Runs in development mode, starting the server and a local webserver, running linting and unit tests, and restarting upon file changes.
* `npm test` : Runs JavaScript file linting and unit tests.
* `npm run watch` : Alternative development mode - does not run servers. Only runs linting and unit tests upon file changes.

## Folder Structure

```
├── coverage          # Coverage reports
├── example           # Example REST API server for testing
└── src
    ├── middleware    # Express middleware utilities
    ├── lib
    │   ├── app.js               # Creates and configures an express app
    │   ├── errors.js            # Custom error classes
    │   └── graceful-shutdown.js # Attempts a graceful server shutdown
    │
    ├── config.js     # Configuration options
    └── server.js     # Starts the express API server on a port
```

## Libraries & Tools

The functionality has been implemented by integrating the following 3rd-party tools and libraries:

 - [Express](https://github.com/strongloop/express): Fast, minimalist web framework for node
 - [Helmet](https://github.com/helmetjs/helmet): Secure Express apps with various HTTP headers
 - [Bunyan](https://github.com/trentm/node-bunyan): A simple and fast JSON logging module for node.js services
 - [Gulp](http://gulpjs.com/): Streaming build system and task runner
 - [Node.js](http://nodejs.org/api/): JavaScript runtime environment for server-side development
 - [Mocha](http://mochajs.org/): The fun, simple, flexible JavaScript test framework
 - [Chai](http://chaijs.com/): BDD/TDD assertion library for node and the browser
 - [Sinon](http://sinonjs.org/): Standalone test spies, stubs and mocks for JavaScript
 - [Mockery](https://github.com/mfncooper/mockery): Mock Node.js module dependencies during testing

## REST API Resources

* <http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api>

## License

[MIT License](http://cgm.mit-license.org/)  Copyright © 2015 Christopher Martin
