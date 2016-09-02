const flatbuffers = require('../../flatbuffers').flatbuffers;

function parse(buf, isJSON, rootFunction) {
    if (isJSON) {
        return JSON.parse(buf);
    }

    const int8array = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    return rootFunction(new flatbuffers.ByteBuffer(int8array));
}

module.exports = parse;
