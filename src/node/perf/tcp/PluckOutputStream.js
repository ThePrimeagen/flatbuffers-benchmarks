'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;
const programArgs = require('../../programArgs');
const toBuffer = require('../../toBuffer');
const AsAService = require('./AsAService');

const objectMode = {objectMode: true};

const PluckOutputStream = function _PluckOutputStream() {
    Transform.call(this, objectMode);
};


module.exports = PluckOutputStream;

inherits(PluckOutputStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean,
 *     clientId: null
 * }} chunk - The chunked data from the framing stream
 */
PluckOutputStream.prototype._transform = function _transform(chunk, enc, cb) {

    const isJSON = chunk.isJSON;

    if (isJSON) {
        const buffer = toBuffer(chunk.lolomo, isJSON);
        this.push(AsAService.createTransportBuffer(buffer, isJSON));
    }
    else {
        this.push(chunk.lolomoRaw);
    }

    cb();
};

PluckOutputStream.prototype._flush = function _flush() { };

