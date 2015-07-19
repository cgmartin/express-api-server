'use strict';
var bunyan = require('bunyan');
var uuid = require('uuid');
var _ = require('lodash');
var path = require('path');

module.exports = function requestLogger(options) {
    options = _.merge({
        requestIdHeader: 'x-request-id',
        conversationIdHeader: 'x-conversation-id'
    }, options);

    var logger = options.logger || createLogger();

    return function(req, res, next) {
        var startTime = Date.now();

        // create child logger with custom tracking ids
        req.log = logger.child({
            reqId: getHeaderTrackingId(req, res, options.requestIdHeader, 'requestId'),
            conversationId: getHeaderTrackingId(req, res, options.conversationIdHeader, 'conversationId')
        });

        res.on('finish', function responseSent() {
            if (req.skipRequestLog) { return; }
            req.log.info(createLogMeta(req, res, startTime), 'request');
        });

        next();
    };
};

function createLogMeta(req, res, startTime) {
    return {
        method: req.method,
        url: req.originalUrl,
        httpVersion: getHttpVersion(req),
        statusCode: res.statusCode,
        contentLength: res['content-length'],
        referrer: getReferrer(req),
        userAgent: req.headers['user-agent'],
        remoteAddress: getIp(req),
        duration: Date.now() - startTime
    };
}

function createLogger() {
    var pkg = require(path.resolve('package.json'));
    return bunyan.createLogger({
        name: pkg.name
    });
}

function getHeaderTrackingId(req, res, headerName, reqKey) {
    var trackingId = req.headers[headerName] || uuid.v1();
    req[reqKey] = trackingId;
    res.setHeader(headerName, trackingId);
    return trackingId;
}

function getIp(req) {
    return req.ip ||
        req._remoteAddress ||
        (req.connection && req.connection.remoteAddress) ||
        undefined;
}

function getHttpVersion(req) {
    return req.httpVersionMajor + '.' + req.httpVersionMinor;
}

function getReferrer(req) {
    return req.headers.referer || req.headers.referrer;
}
