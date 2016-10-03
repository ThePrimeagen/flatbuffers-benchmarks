'use strict';

const flatbuffers = require('../../flatbuffers').flatbuffers;
const zlib = require('zlib');

function isJSONRequest(buf) {
    return buf.readUInt8(0) === 1;
}

function toBuffer(obj, isJSON) {
    if (isJSON) {
        return JSON.stringify(obj);
    }
    return new Buffer(obj.bb.bytes());
}

const AsAService = module.exports = {
    write(res, obj, isJSON, compress) {
        if (compress) {
            res.setHeader('Content-Encoding', 'gzip');
        }

        if (isJSON) {
            res.setHeader('Content-Type', 'application/json');
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }

        let dataBuffer = toBuffer(obj, isJSON);
        if (compress) {
            dataBuffer = zlib.gzipSync(dataBuffer);
        }

        res.write(dataBuffer);
    },

    createTransportBuffer(buf, isJSON, compress) {
        const lenAndTypeBuf = new Buffer(5);

        let newBuf = buf;
        if (compress) {
            newBuf = zlib.gzipSync(buf);
        }

        const len = newBuf.length;
        lenAndTypeBuf.writeUInt32LE(len + 1, 0);
        lenAndTypeBuf.writeUInt8(isJSON ? 1 : 0, 4);

        return Buffer.concat([lenAndTypeBuf, newBuf]);
    },

    // Due to how the framing stream works, the first 4 bytes have
    // been sliced.
    isJSONRequest: isJSONRequest,

    /**
     * will parse the buffer.  If is FBS then rootFunction has to be
     * provided to call.
     */
    parse(buf, rootFunction, compress) {
        const zippedBuffer = buf.slice(1);
        let dataBuffer = zippedBuffer;
        if (compress) {
            dataBuffer = zlib.gunzipSync(dataBuffer);
        }

        if (isJSONRequest(buf)) {
            return JSON.parse(dataBuffer);
        }

        const int8array = new Uint8Array(dataBuffer.buffer,
                                         dataBuffer.byteOffset,
                                         dataBuffer.byteLength);

        return rootFunction(new flatbuffers.ByteBuffer(int8array));
    }
};

