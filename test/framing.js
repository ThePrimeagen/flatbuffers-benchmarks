'use strict';

const inherits = require('util').inherits;

const FramingStream = require('./../FramingStream');
const Duplex = require('stream').Duplex;

const InStream = function() {
    Duplex.call(this);

    const self = this;
    setTimeout(function _timeout() {
        const buf = new Buffer(9);
        buf.writeUInt32LE(10, 0);
        buf.write('hello', 4);
        console.log('pushing', buf);
        self.push(buf);
        const buf2 = new Buffer(5);
        buf2.write('hello', 0);
        console.log('pushing', buf2);
        self.push(buf2);
    }, 500);
};

const OutStream = function() {
    Duplex.call(this);
};

inherits(InStream, Duplex);
inherits(OutStream, Duplex);

InStream.prototype._write = function _write(c, e, cb) {
    cb();
};

OutStream.prototype._write = function _write(c, e, cb) {
    cb();
};

InStream.prototype._read = function _read(c, e) {
};

OutStream.prototype._read = function _read(c, e) {
};

const inStream = new InStream();
const outStream = new OutStream();
const framer = new FramingStream(inStream);

inStream.
    pipe(framer).
    pipe(outStream);
