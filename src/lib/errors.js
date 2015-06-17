'use strict';

var assert = require('assert');
var http = require('http');
var util = require('util');

var errors = module.exports;

/**
 * All HTTP Errors will extend from this object
 */
function HttpError(message, options) {
    // handle constructor call without 'new'
    if (!(this instanceof HttpError)) {
        return new HttpError(message, options);
    }

    HttpError.super_.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'HttpError';
    this.message = message;
    this.statusCode = 500;

    options = options || {};
    if (options.customCode) { this.customCode = options.customCode; }
    if (options.errors)     { this.errors = options.errors; }
    if (options.headers)    { this.headers = options.headers; }
}
util.inherits(HttpError, Error);

/**
 * Helper method to add a WWW-Authenticate header
 * https://tools.ietf.org/html/rfc6750#section-3
 */
HttpError.prototype.authBearerHeader = function(realm, error, description) {
    if (!this.headers) {
        this.headers = {};
    }
    realm = realm || 'Secure Area';
    var authHeader = 'Bearer realm="' + realm + '"';
    if (error) {
        authHeader += ',error="' + error + '"';
    }
    if (description) {
        authHeader += ',error_description="' + description + '"';
    }
    this.headers['WWW-Authenticate'] = authHeader;

    return this;
};

/**
 * Creates a custom API Error sub type
 */
HttpError.extend = function(subTypeName, errorCode, defaultMessage) {
    assert(subTypeName, 'subTypeName is required');

    var SubTypeError = function(message, options) {
        // handle constructor call without 'new'
        if (!(this instanceof SubTypeError)) {
            return new SubTypeError(message, options);
        }

        SubTypeError.super_.call(this, message, options);
        Error.captureStackTrace(this, this.constructor);

        this.name = subTypeName;
        this.statusCode = parseInt(errorCode || 500, 10);
        this.message = message || defaultMessage;
    };

    // Inherit the parent's prototype chain
    util.inherits(SubTypeError, this);
    SubTypeError.extend = this.extend;

    return SubTypeError;
};

errors.HttpError = HttpError;

// Create an error type for each of the 400/500 status codes
var httpCodes = Object.keys(http.STATUS_CODES);
httpCodes.forEach(function(code) {
    if (code < 400) { return; }

    var name = getErrorNameFromCode(code);
    errors[name] = HttpError.extend(name, code, http.STATUS_CODES[code]);
});

/**
 * Convert status description to error name
 */
function getErrorNameFromCode(code) {
    code = parseInt(code, 10);
    var status = http.STATUS_CODES[code];
    if (!status) { return false; }

    var name = '';
    var words = status.split(/\s+/);
    words.forEach(function(w) {
        name += w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    name = name.replace(/\W+/g, '');

    if (!/\w+Error$/.test(name)) {
        name += 'Error';
    }
    return name;
}
