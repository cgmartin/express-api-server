/* jshint -W030 */
'use strict';
var mockery = require('mockery');
var expect  = require('chai').expect;
var sinon   = require('sinon');

describe('Enforce SSL', function() {
    var moduleUnderTest = './enforce-ssl';
    var module;

    before(function() {
        mockery.enable({
            //warnOnUnregistered: false,
            useCleanCache: true
        });
    });

    beforeEach(function() {
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

    it('should redirect if GET not secure', function() {
        var middleware = module();
        var req = {
            method: 'GET',
            originalUrl: '/ORIGINAL_URL',
            headers: {host: 'HOST'}
        };
        var res = {
            redirect: sinon.spy()
        };
        var next = sinon.spy();
        middleware(req, res, next);
        expect(res.redirect.called).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should send 403 if other methods not secure', function() {
        var middleware = module();
        var req = {
            method: 'POST'
        };
        var res = {
            send: sinon.spy()
        };
        var next = sinon.spy();
        middleware(req, res, next);
        expect(res.send.called).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should proceed if secure', function() {
        var middleware = module();
        var req = {
            secure: true
        };
        var res = {};
        var next = sinon.spy();
        middleware(req, res, next);
        expect(next.called).to.be.true;
    });

});
