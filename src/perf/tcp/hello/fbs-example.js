'use strict';

const Hello = require('./hello_generated').Hello;
const Hi = Hello.Hi;
const Hellos = Hello.Hellos;
const flatbuffers = require('./../../../flatbuffers').flatbuffers;
const toBuffer = require('typedarray-to-buffer');
const hiCount = process.env.HI_COUNT || 10;
const percentToMutate = process.env.PERCENT_MUTATION || 0.25;
const mutateAmount = Math.ceil(hiCount * percentToMutate);
const DataGenerator = require('./../../../generator').DataGenerator;

var _recieveFBS = function _recieveFBS(client, buffer) {
    let hello = null;

    if (buffer) {
        hello = hellosFromBuffer(buffer);
    }

    // This is the one time fixed cost.  To _remove_ the cost of this call,
    // simply set the max limit to higher and higher.
    else {
        const bytes = buildHellos();
        hello = Hellos.getRootAsHellos(new flatbuffers.ByteBuffer(bytes));
    }

    mutateRandomHi(hello);
    writeToClient(hello, client);
}

function report(chunk) {
    const hellos = hellosFromBuffer(chunk);
    const len = hellos.hiListLength();
    const space = '   ';

    console.log('Hello {');

    for (let i = 0; i < len; ++i) {
        console.log(space, 'Hi {')

        const hi = hellos.hiList(i);
        console.log(space, space, 'atCount', hi.count());

        console.log(space, '}')
    }
    console.log('}');
}

module.exports = {
    fn: _recieveFBS,
    report: report
}

function writeToClient(fbsObject, writer) {
    const bytes = fbsObject.bb.bytes();
    const lenBuffer = new Buffer(4);

    lenBuffer.writeUInt32LE(bytes.length);
    writer.write(Buffer.concat([lenBuffer, new Buffer(bytes)]));
}

function buildHellos() {
    const fbb = new flatbuffers.Builder(2);
    const hiIndices = [];
    const gen = new DataGenerator();

    for (let i = 0; i < hiCount; ++i) {
        const strOffest = fbb.createString(gen.getRandomString(250));

        Hi.startHi(fbb);
        Hi.addType(fbb, Hello.Type.Hello);
        Hi.addCount(fbb, 1);
        Hi.addConversation(fbb, strOffest);

        // Completes the hi buffer
        const hiIndex = Hi.endHi(fbb);
        hiIndices.push(hiIndex);
    }

    const listOffset = Hellos.createHiListVector(fbb, hiIndices);
    Hellos.startHellos(fbb);
    Hellos.addHiList(fbb, listOffset);

    const hellosIndex = Hellos.endHellos(fbb);
    Hellos.finishHellosBuffer(fbb, hellosIndex);

    return fbb.asUint8Array();
}

function mutateRandomHi(hellos) {

    const len = hellos.hiListLength();
    for (let i = 0; i < mutateAmount; ++i) {
        const rIndex = Math.floor(Math.random() * len);
        const hi = hellos.hiList(rIndex);

        hi.mutate_count(hi.count() + 1);
    }
}

function hellosFromBuffer(buffer) {

    // Convert the buffer to an uint8array
    const ab = buffer.buffer.
            slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const int8array = new Uint8Array(buffer.buffer,
                                     buffer.byteOffset,
                                     buffer.byteLength);
    const hello = Hellos.getRootAsHellos(new flatbuffers.ByteBuffer(int8array));

    return hello;
}
