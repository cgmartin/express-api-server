'use strict';

var fs = require('fs');
var _ = require('lodash');
var cfgDefaults = require('./config');
var https = require('https');
var http = require('http');
var createApp = require('./lib/app');
var gracefulShutdown = require('./lib/graceful-shutdown');

module.exports = function startServer(appInitCb, options) {
    // Initialize the express app
    options = _.merge({}, cfgDefaults, options);
    var app = createApp(appInitCb, options);

    // Create a secure or insecure server
    var server;
    if (!options.isBehindProxy && options.isSslEnabled) {
        // Secure https server
        var sslOptions = {
            key:  fs.readFileSync(options.sslKeyFile),
            cert: fs.readFileSync(options.sslCertFile)
        };
        server = https.createServer(sslOptions, app);
    } else {
        // Insecure http server
        server = http.createServer(app);
    }

    // Limits maximum incoming headers count
    server.maxHeadersCount = options.maxHeadersCount;

    // Inactivity before a socket is presumed to have timed out
    server.timeout = options.serverTimeout;

    // Start the server on port
    server.listen(options.port, function listenCb() {
        var host = server.address().address;
        var port = server.address().port;
        var scheme = (server instanceof https.Server) ? 'https' : 'http';
        console.info('api server listening at %s://%s:%s', scheme, host, port);
        if (options.isGracefulShutdownEnabled) {
            gracefulShutdown(server);
        }
    });

    return server;
};
