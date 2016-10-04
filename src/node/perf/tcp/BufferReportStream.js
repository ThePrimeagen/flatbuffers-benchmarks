'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const objectMode = {objectMode: true};

const BufferReportStream = function _BufferReportStream() {
    Transform.call(this, objectMode);
};

module.exports = BufferReportStream;

inherits(BufferReportStream, Transform);

BufferReportStream.prototype._transform = function _transform(chunk, enc, cb) {
    console.log('chunk', chunk);
    this.push(chunk);
    cb();
};

BufferReportStream.prototype._flush = function _flush() {
    console.log('BufferReportStream#flush');
};

