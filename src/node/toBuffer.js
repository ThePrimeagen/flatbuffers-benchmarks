'use strict';

const flatstr = require('flatstr');

module.exports = function toBuffer(jsonOrFB, isJSON) {
    if (isJSON) {

        // Flat str has significantly better performance for strings being
        // turned into buffers.
        return new Buffer(flatstr(JSON.stringify(jsonOrFB)));
    }

    return new Buffer(jsonOrFB);
}
