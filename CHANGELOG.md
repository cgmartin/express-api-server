0.0.7 / 2015-06-28
==================

- fix: Request logs are not reporting the correct (full) url path


0.0.6 / 2015-06-21
==================

- update: Improve error handling of uncaught exceptions during a request. Now uses a domain to catch, log the error, and send a response before rethrowing to the graceful shutdown handler (if enabled).

0.0.5 / 2015-06-20
==================

- fix: Error type has incorrect app/custom code property name. Changed HttpError `appCode`/`customCode` to `code`, and `statusCode` to `status`

0.0.4 / 2015-06-18
==================

- fix: Republish due to NPM registry checksum issue

0.0.3 / 2015-06-16
==================

- update: Add method override middleware for browser clients

0.0.2 / 2015-06-16
==================

- update: Support all HTTP Error types - Dynamically creates all error types from HTTP codes
- update: Log unhandled errors

0.0.1
=====

This file was started after the release of 0.0.1.
