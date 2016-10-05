'use strict';

const zlib = require('zlib');
const flatstr = require('flatstr');

const flatbuffers = require('../../flatbuffers').flatbuffers;
const toBuffer = require('../toBuffer');

function isJSONRequest(buf) {
    return buf.readUInt8(0) === 1;
}


const AsAService = module.exports = {
    toTCPBuffer: function toTCPBuffer(obj, isJSON, compress) {
        const buf = toBuffer(obj, isJSON);
        return AsAService.createTransportBuffer(buf, isJSON, compress);
    },

    write(res, obj, isJSON, compress, noManipulationNeeded) {
        if (noManipulationNeeded) {
            return res.write(obj);
        }

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

    createTransportBuffer(buf, isJSON) {
        const lenAndTypeBuf = new Buffer(5);

        const len = buf.length;

        // Include the length of the length byte that way the framing stream can
        // use that as part of the buffer collection.  Its output will be an
        // object instead of a single buffe.  This will lead to a fantastic
        // opportunity for less copying, which should make fbs much faster.
        lenAndTypeBuf.writeUInt32LE(len + 5, 0);
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
