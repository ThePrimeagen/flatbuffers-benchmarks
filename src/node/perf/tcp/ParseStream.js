'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;
const zlib = require('zlib');

const AsAService = require('./AsAService');
const flatbuffers = require('../../flatbuffers').flatbuffers;

const objectMode = {objectMode: true};

const ParseStream = function _ParseStream(rootFunction) {
    Transform.call(this, objectMode);
    this._rootFunction = rootFunction;
};

module.exports = ParseStream;

inherits(ParseStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean
 * }} chunk - The chunked data from the framing stream
 */
ParseStream.prototype._transform = function _transform(chunk, enc, cb) {

    const isJSON = chunk.isJSON = isJSONRequest(chunk.unparsed);
    chunk.parsed = _parse(chunk.unparsed.slice(1), isJSON, rootFunction);

    this.push(chunk)
    cb();
};

ParseStream.prototype._flush = function _flush() {
    console.log('ParseStream#flush');
};

function _parse(dataBuffer, isJSON, rootFunction) {
    if (isJSON) {
        return JSON.parse(dataBuffer);
    }

    const int8array = new Uint8Array(dataBuffer.buffer,
                                        dataBuffer.byteOffset,
                                        dataBuffer.byteLength);

    return rootFunction(new flatbuffers.ByteBuffer(int8array));
}
