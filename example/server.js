'use strict';
/**
 * Example:
 * How to use the api server with custom routes and config
 */
var path = require('path');
var expressApiServer = require('../src'); // require('express-api-server');

var apiOptions = {
    baseUrlPath: '/api',
    sslKeyFile:  path.join(__dirname, '/keys/60638403-localhost.key'),
    sslCertFile: path.join(__dirname, '/keys/60638403-localhost.cert'),
    cors: {},
    isGracefulShutdownEnabled: false
};

var initApiRoutes = function(app, options) {
    // Set up routes off of base URL path
    app.use(options.baseUrlPath, [
        require('./todos')
    ]);
};

expressApiServer.start(initApiRoutes, apiOptions);

// Use environment variables for other options:
//   API_COMPRESSION=1 API_SSL=1 API_PORT=4443 node example/start.js
