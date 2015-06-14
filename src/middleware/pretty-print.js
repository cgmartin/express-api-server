'use strict';

module.exports = function prettyPrint(app) {
    return function(req, res, next) {
        if (req.query.pretty === 'true' || req.query.pretty === '1') {
            app.set('json spaces', 2);
        }
        next();
    };
};

