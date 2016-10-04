'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const objectMode = {objectMode: true};

const ToSocket = function _ToSocket(socket) {
    Transform.call(this, objectMode);
    this._socket = socket;
};

module.exports = ToSocket;

inherits(ToSocket, Transform);

ToSocket.prototype._transform = function _transform(chunk, enc, cb) {

    // TODO: This seems wrong.  What am I missing?
    //
    // Why does socket.pipe(...).pipe(socket) not work.
    socket.write(chunk);
    cb();
};

ToSocket.prototype._flush = function _flush() { };
