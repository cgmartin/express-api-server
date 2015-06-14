'use strict';

var assert = require('assert');
var util = require('util');

var errors = module.exports;

/**
 * All API Errors extend from this object
 */
function ApiError(message, options) {
    // handle constructor call without 'new'
    if (!(this instanceof ApiError)) {
        return new ApiError(message, options);
    }

    ApiError.super_.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ApiError';
    this.message = message;
    this.statusCode = 500;

    options = options || {};
    if (options.customCode) { this.customCode = options.customCode; }
    if (options.errors)     { this.errors = options.errors; }
    if (options.headers)    { this.headers = options.headers; }
}
util.inherits(ApiError, Error);

/**
 * Helper method to add a WWW-Authenticate header
 * https://tools.ietf.org/html/rfc6750#section-3
 */
ApiError.prototype.authBearerHeader = function(realm, error, description) {
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
ApiError.extend = function(subTypeName, errorCode, defaultMessage) {
    assert(subTypeName, 'subTypeName is required');

    var SubTypeError = function(message, options) {
        // handle constructor call without 'new'
        if (!(this instanceof SubTypeError)) {
            return new SubTypeError(message, options);
        }

        SubTypeError.super_.call(this, message, options);
        Error.captureStackTrace(this, this.constructor);

        this.name = subTypeName;
        this.statusCode = errorCode;
        this.message = message || defaultMessage;
    };

    // Inherit the parent's prototype chain
    util.inherits(SubTypeError, this);
    SubTypeError.extend = this.extend;

    return SubTypeError;
};

errors.ApiError = ApiError;

// The request is malformed, such as if the body does not parse or is missing
errors.BadRequestError = ApiError.extend('BadRequest', 400, 'Bad request');

// When no or invalid authentication details are provided.
errors.UnauthorizedError = ApiError.extend('UnauthorizedError', 401, 'Unauthorized');

// When authentication succeeded but authenticated user doesn't have access to the resource
errors.ForbiddenError = ApiError.extend('ForbiddenError', 403, 'Forbidden');

// When a non-existent resource is requested
errors.NotFoundError = ApiError.extend('NotFoundError', 404, 'Not found');

// When an HTTP method is being requested that isn't allowed for the authenticated user
errors.MethodNotAllowedError = ApiError.extend('MethodNotAllowedError', 405, 'Method not allowed');

// Indicates that the resource at this end point is no longer available.
// Useful as a blanket response for old API versions
errors.GoneError = ApiError.extend('GoneError', 410, 'End point is no longer available');

// Used for validation errors
errors.UnprocessableEntityError = ApiError.extend('UnprocessableEntityError', 422, 'Entity validation error');
