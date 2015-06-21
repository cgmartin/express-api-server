var errors = require('../lib/errors');
var createDomain = require('domain').create;

var domainMiddleware = module.exports = function(req, res, next) {
    var domain = createDomain();
    domain.add(req);
    domain.add(res);
    domain.run(function() {
        next();
    });
    domain.on('error', function(err) {
        if (req.log) { req.log.error(err, 'error'); }
        next(new errors.InternalServerError('Unhandled exception', {cause: err}));
        throw err; // rethrow to global error handler
    });
};

