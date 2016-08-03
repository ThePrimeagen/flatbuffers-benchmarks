'use strict';

const Generator = require('./../../generator');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('./../../../flatbuffers').flatbuffers;
const toBuffer = require('typedarray-to-buffer');
const random = require('../../../generator/random');
const ROWS = process.env.ROWS;
const COLUMNS = process.env.COLUMNS;
const PERCENT_SIMILAR = process.env.PERCENT_SIMILAR;
const MUTATION_COUNT = process.env.MUTATION_COUNT;
const Lolomo = Generator.NetflixFBS.Lolomo;

var _recieveFBS = function _recieveFBS(client, buffer) {
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
    const rLen = lolomo.rowsLength();
    const space = '   ';

    console.log('Lolomo {');

    for (let i = 0; i < rLen; ++i) {
        console.log(space, 'Row {')

        const row = lolomo.rows(i);
        const vLen = row.videosLength();
        console.log(space, space, 'title', row.title());

        for (let j = 0; j < len; ++j) {
            console.log(space, space, 'Video {')

            const video = row.videos(i);
            console.log(space, space, space, 'title', video.title());
            console.log(space, space, space, 'title', video.runningTime());

            console.log(space, space, '}')
        }
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

function buildLolomo() {
    const gen = new LolomoGenerator();
    return gen.getLolomoAsFBS(ROWS, COLUMNS, PERCENT_SIMILAR);
}

/**
 *
 */
function mutate(lolomo) {

    const rLength = lolomo.rowsLength();
    for (let i = 0; i < MUTATION_COUNT; ++i) {
        const lIndex = Math.floor(Math.random() * rLength);
        const row = lolomo.rows(rIndex);

        const vLength = row.videosLength();
        const vIndex = Math.floor(Math.random() * vLength);
        const video = lolomo.videos(vIndex);

        video.mutate_runningTime(video.runningTime() + 1);
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
