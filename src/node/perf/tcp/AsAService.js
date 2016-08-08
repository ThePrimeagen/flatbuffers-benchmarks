'use strict';

const flatbuffers = require('../../flatbuffers');

function isJSONRequest(buf) {
    return buf.readUInt8(0) === 1;
}

const AsAService = module.exports = {
    createTransportBuffer(buf, isJSON) {
        const len = buf.length;
        const lenAndTypeBuf = new Buffer(5);
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
    parse(buf, rootFunction) {
        const dataBuffer = buf.slice(1);
        if (isJSONRequest(buf)) {
            return JSON.parse(dataBuffer.toString());
        }

        const ab = buf.buffer.
                slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        const int8array = new Uint8Array(buf.buffer,
                                         buf.byteOffset,
                                         buf.byteLength);
        return rootFunction(new flatbuffers.ByteBuffer(int8array));
    }
};

