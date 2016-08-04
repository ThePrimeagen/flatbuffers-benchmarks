'use strict';

const Duplex = require('stream').Duplex;
const inherits = require('util').inherits;

const FramingStream = function _FramingStream(parentStream) {
    Duplex.call(this);

    this._buf = null;
    this._len = 0;
    this._totalLen = 0;
    this._parentStream = parentStream;

    const self = this;
    parentStream.on('data', function _onData(chunk) {
        self._frameData(chunk);
    });
}

module.exports = FramingStream;

inherits(FramingStream, Duplex);
FramingStream.prototype._write = function _write(chunk, enc, cb) {

    // passes all writes through.
    this._parentStream.write(chunk, enc);

    // Signals that the write operation has completed.
    cb();
};

FramingStream.prototype._read = function _read(size) {
    // Todo: Figure out the purpose of _reading
};

FramingStream.prototype._frameData = function _frameData(chunk) {

    let remainingLength = chunk.length;
    let remainingData = chunk;

    // auto assumes that the first 32 bits is an unsigned int.
    let frameMark = 0;

    // Why a doWhile?  Because they are awesome.
    do {

        // Buf is empty, therefore there is no previous results.
        // Therefore, we must initialize our aggregator.
        if (this._buf === null) {
            remainingData = this._initializeAggregator(remainingData, frameMark);
            remainingLength = remainingData.length;
        }

        // We must frame this stream with the next incoming data.
        if (this._totalLength > this._len + remainingLength) {

            // there is a previous buffer that was created.
            if (this._buf) {
                this._buf = Buffer.concat([this._buf, remainingData]);
            }

            else {
                this._buf = remainingData;
            }

            this._len += remainingLength;
            remainingLength = 0;
        }

        // What remains in this chunk is the data we expect.
        else if (this._totalLength === this._len + remainingLength) {
            remainingLength = 0;

            // Pass the remaining data to the next item.
            this.push(this._aggregate(remainingData));
            this._buf = null;
        }

        // There is more than one message in this chunk.
        else {
            this.push(remainingData.slice(0, this._totalLen));
            this._buf = null;
            this._len = 0;

            frameMark = this._totalLen;
        }

    } while (remainingLength > 0);
};

FramingStream.prototype._initializeAggregator = function _initAgg(chunk, start) {
    this._totalLength = chunk.readUInt32LE(start);
    this._len = 0;

    return chunk.slice(start + 4);
};

FramingStream.prototype._aggregate = function _aggregate(buf) {
    if (this._buf) {
        return Buffer.concat([this._buf, buf]);
    }
    return buf;
};
