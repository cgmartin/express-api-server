/* jshint -W030 */
'use strict';
var mockery = require('mockery');
var expect  = require('chai').expect;
var sinon   = require('sinon');

describe('Enforce SSL', function() {
    var moduleUnderTest = './pretty-print';
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

    it('should set json spaces with pretty query param true', function() {
        var app = {
            set: sinon.spy()
        };
        var middleware = module(app);
        var req = {
            query: {pretty: 'true'}
        };
        var next = sinon.spy();
        middleware(req, null, next);
        expect(app.set.called).to.be.true;
        expect(next.called).to.be.true;
    });

    it('should not set json spaces with untrue pretty query param', function() {
        var app = {
            set: sinon.spy()
        };
        var middleware = module(app);
        var req = {
            query: {pretty: 'false'}
        };
        var next = sinon.spy();
        middleware(req, null, next);
        expect(app.set.called).to.be.false;
        expect(next.called).to.be.true;
    });

});
