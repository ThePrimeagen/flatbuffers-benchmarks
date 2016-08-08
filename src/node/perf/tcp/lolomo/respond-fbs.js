'use strict';

const Generator = require('../../../generator');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const toBuffer = require('typedarray-to-buffer');
const random = require('../../../generator/random');
const Lolomo = Generator.NetflixFBS.Lolomo;
const processArgs = require('../../../programArgs');

function responder(client, buffer) {
    let lolomo = null;

    if (buffer) {
        lolomo = lolomoFromBuffer(buffer);
    }

    // This is the one time fixed cost.  To _remove_ the cost of this call,
    // simply set the max limit to higher and higher.
    else {
        const bytes = buildLolomo();
        lolomo = Lolomo.getRootAsLolomo(new flatbuffers.ByteBuffer(bytes));
    }

    mutate(lolomo);
    writeToClient(lolomo, client);
}

function report(chunk) {
    const lolomo = lolomoFromBuffer(chunk);
    LolomoGenerator.printFBS(lolomo);
}

module.exports = {
    responder: responder,
    report: report
}

function writeToClient(fbsObject, writer) {
    const bytes = fbsObject.bb.bytes();
    const lenBuffer = new Buffer(4);

    lenBuffer.writeUInt32LE(bytes.length);
    writer.write(Buffer.concat([lenBuffer, new Buffer(bytes)]));
}

function buildLolomo() {
    const gen = new LolomoGenerator();
    return gen.getLolomoAsFBS(processArgs.rows, processArgs.columns,
                              processArgs.percentSimilar, processArgs.isGraph);
}

/**
 *
 */
function mutate(lolomo) {

    const rLength = lolomo.rowsLength();
    for (let i = 0; i < processArgs.mutationCount; ++i) {
        const rIndex = Math.floor(Math.random() * rLength);
        const row = lolomo.rows(rIndex);

        const vLength = row.videosLength();
        const vIndex = Math.floor(Math.random() * vLength);
        const video = row.videos(vIndex);

        const runningTime = video.runningTime();
        video.mutate_runningTime(runningTime + 1);
    }
}

function lolomoFromBuffer(buffer) {

    // Convert the buffer to an uint8array
    const ab = buffer.buffer.
            slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const int8array = new Uint8Array(buffer.buffer,
                                     buffer.byteOffset,
                                     buffer.byteLength);
    const lolomo = Lolomo.getRootAsLolomo(new flatbuffers.ByteBuffer(int8array));

    return lolomo;
}
