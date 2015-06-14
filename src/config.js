'use strict';

module.exports = {
    // A base URL path prefix, i.e. "/api"
    baseUrlPath: process.env.API_BASE_URL,

    // Enable gzip compression for response output
    isCompressionEnabled: (process.env.API_COMPRESSION === '1'),

    // Wait for connections to close before stopping server
    isGracefulShutdownEnabled: (process.env.API_GRACEFUL_SHUTDOWN === '1'),

    // See https://github.com/expressjs/compression#options
    compressionOptions: {
        threshold: 4000
    },

    // Enable this if behind a secure reverse proxy, like heroku
    isBehindProxy: (process.env.API_REV_PROXY === '1'),

    // Server port. For ports 80 or 443, must be started as superuser
    port: parseInt(process.env.API_PORT || process.env.PORT || 8000),

    // Enable for HTTPS
    isSslEnabled: (process.env.API_SSL === '1'),

    // HTTPS key/cert file paths
    sslKeyFile: process.env.API_SSL_KEY,
    sslCertFile: process.env.API_SSL_CERT,

    // HTTP Strict Transport Security options
    // see: https://github.com/helmetjs/hsts
    hsts: {
        maxAge: 7776000000, // ninety days in ms
        includeSubdomains: true,
        preload: true
    },

    // Limits maximum incoming headers count. If set to 0 - no limit will be applied.
    maxHeadersCount: 1000,

    // The number of milliseconds of inactivity before a socket is presumed to have timed out.
    serverTimeout: 2 * 60 * 1000, // 2 minutes

    // Cross-site HTTP requests
    // https://github.com/expressjs/cors#configuring-cors
    cors: false
};

