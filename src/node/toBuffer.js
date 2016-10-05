'use strict';

const flatstr = require('flatstr');

module.exports = function toBuffer(obj, isJSON) {

    // For when we do zero copy stuff, we do not need to bufferize an object
    // i.e. json.
    if (obj instanceof Buffer) {
        return obj;
    }

    if (isJSON) {
        return new Buffer(flatstr(JSON.stringify(obj)));
    }

    if (obj.bb) {
        return new Buffer(obj.bb.bytes());
    }

    // This should be the uint8 array case.
    return new Buffer(obj);
};

