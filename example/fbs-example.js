'use strict';

const Hello = require('./hello_generated').Hello;
const Hi = Hello.Hi;
const flatbuffers = require('./flatbuffers').flatbuffers;
const toBuffer = require('typedarray-to-buffer');

module.exports = function _recieveFBS(client, buffer) {
    let hello = null;

    if (buffer) {

        // Convert the buffer to an uint8array
        const ab = buffer.buffer.
                slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const int8array = new Uint8Array(buffer.buffer,
                                         buffer.byteOffset,
                                         buffer.byteLength);
        hello = Hi.getRootAsHi(new flatbuffers.ByteBuffer(int8array));
    }

    // This is the one time fixed cost.  To _remove_ the cost of this call,
    // simply set the max limit to higher and higher.
    else {
        const bytes = buildHi(-1);
        hello = Hi.getRootAsHi(new flatbuffers.ByteBuffer(bytes));

    }

    const nextCount = hello.count() + 1;
    const nextHello = toBuffer(buildHi(nextCount));
    const lenBuffer = new Buffer(4);

    lenBuffer.writeUInt32LE(nextHello.length);
    client.write(Buffer.concat([lenBuffer, nextHello]));
}

function buildHi(count) {
    const fbb = new flatbuffers.Builder(2);
    Hi.startHi(fbb);
    Hi.addType(fbb, Hello.Type.Hello);
    Hi.addCount(fbb, count);

    // Completes the hi buffer
    const hiIndex = Hi.endHi(fbb);
    Hi.finishHiBuffer(fbb, hiIndex);

    return fbb.asUint8Array();
}
