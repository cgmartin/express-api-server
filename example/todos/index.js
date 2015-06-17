'use strict';
/**
 * Example express router for "todo" resources
 */
var express = require('express');
var jsonParser = require('body-parser').json();
var expressApiServer = require('../../src'); // require('express-api-server');
var errors = expressApiServer.errors;
var getFullBaseUrl = expressApiServer.getFullBaseUrl;
var validator = require('is-my-json-valid');
var todoSchema = require('./todo-schema');
var validate = validator(todoSchema);
var filter = validator.filter(todoSchema);

var router = module.exports = express.Router();

//
// Route Definitions
// -----------------------------------------------------------------

router.all('*', requireAuthentication); // authenticate all methods

router.route('/todos')
    .get(retrieveTodoList)         // GET /todos
    .post(jsonParser, createTodo); // POST /todos

router.param('todo_id', fetchTodoParam); // fetch the resource by param id

router.route('/todos/:todo_id')
    .get(retrieveTodo)      // GET /todos/1
    .put(updateTodo)        // PUT /todos/1
    .delete(deleteTodo);    // DELETE /todos/1

//
// Route Actions
// -----------------------------------------------------------------

function requireAuthentication(req, res, next) {
    // Unauthorized example:
    //return next((new errors.UnauthorizedError()).authBearerHeader());
    next();
}

function retrieveTodoList(req, res, next) {
    // ...Retrieve from backend...
    var todos = [
        {id: 1, title: 'Do something', isComplete: true},
        {id: 2, title: 'Do something else', isComplete: false}
    ];
    res.json(todos);
}

function createTodo(req, res, next) {
    if (!req.body) { return next(new errors.BadRequestError()); }

    // Validate JSON with schema
    var newTodo = filter(req.body);
    if (!validate(newTodo)) {
        req.log.error('Invalid todo body'); // Bunyan logger available on req
        return next(new errors.UnprocessableEntityError('Invalid todo resource body', {errors: validate.errors}));
    }

    // ...Save in backend...
    newTodo.id = '3';

    res.status(201); // Created
    res.location(getFullBaseUrl(req) + '/todos/' + newTodo.id);
    res.json(newTodo);
}

function fetchTodoParam(req, res, next, id) {
    // Retrieve resource from backend, attach to request...
    req.todo = {
        id: id,
        title: 'Do something',
        isComplete: false
    };
    next();
}

function retrieveTodo(req, res, next) {
    res.json(req.todo); // Already retrieved by param function
}

function updateTodo(req, res, next) {
    var todo = req.todo;
    // Example: Resource is forbidden to this user
    return next(new errors.ForbiddenError());
}

function deleteTodo(req, res, next) {
    var todo = req.todo;
    // Example: Method is not allowed for this user
    return next(new errors.MethodNotAllowedError());
}

