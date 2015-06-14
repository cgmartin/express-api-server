/* jshint -W030 */
'use strict';
var mockery = require('mockery');
var expect  = require('chai').expect;
var sinon   = require('sinon');

describe('Enforce SSL', function() {
    var moduleUnderTest = './request-logger';
    var module;
    var loggerStub;
    var logStub;

    before(function() {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
    });

    beforeEach(function() {
        logStub = {
            info: sinon.stub()
        };
        loggerStub = {
            child: sinon.stub().returns(logStub)
        };
        var bunyanMock = {
            createLogger: sinon.stub().returns(loggerStub)
        };
        mockery.registerMock('bunyan', bunyanMock);

        // Load module under test for each test
        mockery.registerAllowable(moduleUnderTest, true);
        module = require(moduleUnderTest);
    });

    afterEach(function() {
        // Unload module under test each time to reset
        mockery.deregisterAllowable(moduleUnderTest);
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should log request', function() {
        var options = {};
        var middleware = module(options);
        var req = {
            method: 'METHOD',
            url: 'URL',
            httpVersionMajor: 'MAJ',
            httpVersionMinor: 'MIN',
            headers: {
                referrer: 'REFERRER',
                'x-request-id': 'REQID',
                'x-conversation-id': 'CONVID'
            },
            connection: {remoteAddress: false},
            'user-agent': 'USERAGENT'
        };
        var res = {
            setHeader: sinon.stub(),
            statusCode: 'STATUSCODE',
            'content-length': 'CONTENTLEN',
            on: sinon.stub().yields()
        };
        var next = sinon.spy();
        middleware(req, res, next);
        expect(res.on.called).to.be.true;
        sinon.assert.calledWith(loggerStub.child, {
            reqId: 'REQID',
            conversationId: 'CONVID'
        });
        sinon.assert.calledWith(logStub.info, sinon.match({
            method: 'METHOD',
            url: 'URL',
            httpVersion: 'MAJ.MIN',
            contentLength: 'CONTENTLEN',
            referrer: 'REFERRER',
            remoteAddress: undefined
        }), 'request');
        expect(next.called).to.be.true;
    });

    it('should generate tracking ids', function() {
        var options = {};
        var middleware = module(options);
        var req = {
            headers: {},
            connection: {remoteAddress: false},
        };
        var res = {
            setHeader: sinon.stub(),
            on: sinon.stub()
        };
        var next = sinon.spy();
        middleware(req, res, next);
        expect(res.on.called).to.be.true;

        var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
        sinon.assert.calledWithMatch(loggerStub.child, {
            reqId: sinon.match(uuidRegex),
            conversationId: sinon.match(uuidRegex)
        });
        expect(res.setHeader.calledTwice).to.be.true;
        expect(next.called).to.be.true;
    });

});
