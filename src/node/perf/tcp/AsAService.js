'use strict';

const zlib = require('zlib');
const flatstr = require('flatstr');

const flatbuffers = require('../../flatbuffers').flatbuffers;

function isJSONRequest(buf) {
    return buf.readUInt8(0) === 1;
}

function toBuffer(obj, isJSON) {

    // For when we do zero copy stuff, we do not need to bufferize an object
    // i.e. json.
    if (obj instanceof Buffer) {
        return obj;
    }

    if (isJSON) {
        return new Buffer(JSON.stringify(obj));
    }

    if (obj.bb) {
        return new Buffer(obj.bb.bytes());
    }

    // This should be the uint8 array case.
    return new Buffer(obj);
}

const AsAService = module.exports = {
    write(res, obj, isJSON, compress) {

        let dataBuffer = toBuffer(obj, isJSON);
        if (compress) {
            zlib.gzip(dataBuffer, function _gzip(e, data) {
                res.write(AsAService.createTransportBuffer(data, isJSON,
                                                           compress));
            });
            return;
        }

        res.write(AsAService.createTransportBuffer(dataBuffer, isJSON,
                                                   compress));
    },

    createTransportBuffer(buf, isJSON, compress) {
        const lenAndTypeBuf = new Buffer(5);

        const len = buf.length;
        lenAndTypeBuf.writeUInt32LE(len + 1, 0);
        lenAndTypeBuf.writeUInt8(isJSON ? 1 : 0, 4);

        return Buffer.concat([lenAndTypeBuf, buf]);
    },

    // Due to how the framing stream works, the first 4 bytes have
    // been sliced.
    isJSONRequest: isJSONRequest,

    /**
     * will parse the buffer.  If is FBS then rootFunction has to be
     * provided to call.
     */
    parse(buf, rootFunction, compress, cb) {
        const zippedBuffer = buf.slice(1);
        const isJSON = isJSONRequest(buf);

        if (compress) {
            zlib.gunzip(zippedBuffer, function _unZip(e, dataBuffer) {
                if (e) {
                    return cb(e);
                }
                cb(null, _parse(dataBuffer, isJSON, rootFunction));
            });
            return;
        }

        cb(null, _parse(zippedBuffer, isJSON, rootFunction));
    }
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
