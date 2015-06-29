'use strict';

/**
 * Shutdown a http server gracefully in production environments
 *
 * @param {object} server Node http server
 */
module.exports = function gracefulShutdown(server) {
    var shutdownInProgress = false;

    // Shut down gracefully
    var shutdownGracefully = function(retCode) {
        retCode = (typeof retCode !== 'undefined') ? retCode : 0;

        if (server) {
            if (shutdownInProgress) { return; }

            shutdownInProgress = true;
            console.info('Shutting down gracefully...');
            server.close(function() {
                console.info('Closed out remaining connections');
                process.exit(retCode);
            });

            setTimeout(function() {
                console.error('Could not close out connections in time, force shutdown');
                process.exit(retCode);
            }, 10 * 1000).unref();

        } else {
            console.debug('Http server is not running. Exiting');
            process.exit(retCode);
        }
    };

    process.on('uncaughtException', function(err) {
        console.error('uncaughtException', err);
        shutdownGracefully(1);
    });

    process.on('SIGTERM', shutdownGracefully);
    process.on('SIGINT', shutdownGracefully);
};
