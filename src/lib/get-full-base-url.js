'use strict';

module.exports = getFullBaseUrl;

function getFullBaseUrl(req) {
    return req.protocol + '://' + req.get('Host') + req.baseUrl;
}
