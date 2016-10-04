'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const objectMode = {objectMode: true};

const BufferReportStream.js = function _BufferReportStream.js() {
    Transform.call(this, objectMode);
};

module.exports = BufferReportStream.js;

inherits(BufferReportStream.js, Transform);

BufferReportStream.js.prototype._transform = function _transform(chunk, enc, cb) {
    console.log('chunk', chunk);
    this.push(chunk);
    cb();
};

BufferReportStream.js.prototype._flush = function _flush() {
    console.log('BufferReportStream#flush');
};

