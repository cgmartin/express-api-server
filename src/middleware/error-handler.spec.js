/* jshint -W030 */
'use strict';
var mockery = require('mockery');
var expect  = require('chai').expect;
var sinon   = require('sinon');

describe('Error Handler', function() {
    var moduleUnderTest = './error-handler';
    var errorHandler;

    before(function() {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
    });

    beforeEach(function() {
        // Load module under test for each test
        mockery.registerAllowable(moduleUnderTest, true);
        errorHandler = require(moduleUnderTest);
    });

    afterEach(function() {
        // Unload module under test each time to reset
        mockery.deregisterAllowable(moduleUnderTest);
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should respond with default 500 error', function() {
        var err = {message: 'ERROR_MESSAGE'};
        var req = {log: {error: sinon.spy()}};
        var res = {
            set: sinon.spy(),
            status: sinon.stub(),
            json: sinon.spy()
        };
        res.status.returns(res);
        var next = sinon.spy();
        errorHandler(err, req, res, next);
        expect(res.set.called).to.be.false;
        expect(res.status.calledWith(500)).to.be.true;
        expect(next.called).to.be.false;
        expect(res.json.calledWith({message: 'ERROR_MESSAGE', code: 500}));
    });

    it('should set optional headers', function() {
        var err = {message: 'ERROR_MESSAGE', headers: {test: 'TEST_HEADER'}};
        var req = {log: {error: sinon.spy()}};
        var res = {
            set: sinon.spy(),
            status: sinon.stub(),
            json: sinon.spy()
        };
        res.status.returns(res);
        var next = sinon.spy();
        errorHandler(err, req, res, next);
        expect(res.set.calledWith({test: 'TEST_HEADER'})).to.be.true;
    });

    it('should set status and app codes', function() {
        var err = {message: 'ERROR_MESSAGE', statusCode: 404, appCode: 1337};
        var req = {log: {error: sinon.spy()}};
        var res = {
            set: sinon.spy(),
            status: sinon.stub(),
            json: sinon.spy()
        };
        res.status.returns(res);
        var next = sinon.spy();
        errorHandler(err, req, res, next);
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({message: 'ERROR_MESSAGE', code: 1337}));
    });

    it('should set extra field errors', function() {
        var err = {message: 'ERROR_MESSAGE', errors: []};
        var req = {log: {error: sinon.spy()}};
        var res = {
            set: sinon.spy(),
            status: sinon.stub(),
            json: sinon.spy()
        };
        res.status.returns(res);
        var next = sinon.spy();
        errorHandler(err, req, res, next);
        expect(res.json.calledWith({message: 'ERROR_MESSAGE', code: 500, errors: []}));
    });
});
