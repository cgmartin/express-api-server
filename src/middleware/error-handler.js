'use strict';

var errors = require('../lib/errors');

/**
 * Express route error handler: send back JSON error responses
 */
module.exports = function errorHandler(err, req, res, next) {
    // Only log unexpected errors
    if (!(err instanceof errors.HttpError)) {
        req.log.error(err, 'error');
    }

    // Set optional headers
    if (err.headers) {
        res.set(err.headers);
    }

    var response = {
        message: err.message  // Description of error
    };

    var status = err.statusCode || 500;

    // Unique application error code
    response.code = err.appCode || status;

    // Additional field error messages
    if (err.errors) { response.errors = err.errors; }

    res.status(status).json(response);
};

