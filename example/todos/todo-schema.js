'use strict';
// https://github.com/mafintosh/is-my-json-valid
// http://json-schema.org/documentation.html
module.exports = {
    name: 'todo',
    type: 'object',
    additionalProperties: false,
    required: ['title'],
    properties: {
        id:         { type: 'string', maxLength: 64 },
        title:      { type: 'string', maxLength: 255 },
        isComplete: { type: 'boolean' }
    }
};
