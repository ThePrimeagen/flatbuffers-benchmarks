'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const objectMode = {objectMode: true};

const LogGrabberStream = function _LogGrabberStream(cb) {
    Transform.call(this, objectMode);
    this._cb = cb;
};


module.exports = LogGrabberStream;

inherits(LogGrabberStream, Transform);

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
LogGrabberStream.prototype._transform = function _transform(chunk, enc, cb) {
    this._cb(chunk);
    this.push(chunk);
    cb();
};

LogGrabberStream.prototype._flush = function _flush() { };

