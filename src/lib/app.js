'use strict';

var _ = require('lodash');
var path = require('path');
var express = require('express');
var cors = require('cors');
var helmet = require('helmet');
var enforceSsl = require('../middleware/enforce-ssl');
var logger = require('../middleware/request-logger');
var errorHandler = require('../middleware/error-handler');
var prettyPrint = require('../middleware/pretty-print');
var compression = require('compression');
var methodOverride = require('method-override');
var domainErrors = require('../middleware/domain-errors');
var errors = require('./errors');

module.exports = function createApp(appInitCb, options) {
    var app = express();

    if (options.isBehindProxy) {
        // http://expressjs.com/api.html#trust.proxy.options.table
        app.enable('trust proxy');
    }

    // Unhandled exception domain handler
    app.use(domainErrors);

    // Logging requests
    app.use(logger({logger: options.logger}));

    // CORS Requests
    if (options.cors) {
        app.use(cors(options.cors));
    }

    // Security middleware
    app.use(helmet.hidePoweredBy());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.frameguard());
    app.use(helmet.xssFilter());
    if (options.isSslEnabled) {
        app.use(helmet.hsts(options.hsts));
        app.use(enforceSsl());
    }

    // Compression settings
    if (options.isCompressionEnabled) {
        app.use(compression(options.compressionOptions));
    }

    // Convenient pretty json printing via `?pretty=true`
    app.use(prettyPrint(app));

    // Allow clients without PUT or DELETE verb support to override POST method
    app.use(methodOverride(options.methodOverrideHeader));

    // Userland callback
    appInitCb(app, options);

    // 404 catch-all
    app.use(function(req, res, next) {
        next(new errors.NotFoundError());
    });

    // Error handler
    app.use(errorHandler);

    return app;
};
