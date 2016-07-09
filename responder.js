'use strict';

const MAX_COUNT = process.env.MAX_COUNT || 1000;
const isJSON = process.env.IS_JSON || true;
const jsonProcessor = require('./json');

module.exports = function _responder(count) {
    let counter = 0;
    return function _counterAndResponder(client, chunkOrObject) {
        if (count) {
            counter++;
            if (counter > MAX_COUNT) {
                client.end();
                return;
            }
        }

        if (isJSON) {
            jsonProcessor(client, chunkOrObject);
        }
    };
};
