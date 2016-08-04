'use strict';

const Generator = require('../../../generator');
const LolomoGenerator = Generator.LolomoGenerator;
const programArgs = require('../../../programArgs');
const randomListItem = require('../../../generator/random').randomListItem;

const responder = function respondJSON(client, jsonOrBuffer) {
    let json = jsonOrBuffer;

    // create an object.
    if (jsonOrBuffer instanceof Buffer) {
        json = JSON.parse(jsonOrBuffer.toString());
    }

    else if (!jsonOrBuffer) {
        const gen = new LolomoGenerator();
        const rows = programArgs.rows;
        const columns = programArgs.columns;
        const percentSimilar = programArgs.percentSimilar;
        const isGraph = programArgs.isGraph;
        json = gen.getLolomoAsJSON(rows, columns, percentSimilar, isGraph);
    }

    mutate(json);
    writeToClient(json, client);
}

function report(chunk) {
    console.log(chunk.toString());
}

module.exports = {
    responder: responder,
    report: report
}

function writeToClient(json, writer) {
    const jsonStr = JSON.stringify(json);
    const buf = new Buffer(4);
    const bufStr = new Buffer(jsonStr);

    buf.writeUInt32LE(bufStr.length, 0);

    const outBuf = Buffer.concat([buf, bufStr]);

    writer.write(outBuf);
}

function mutate(json) {

    const mutationCount = programArgs.mutationCount;
    for (let i = 0; i < mutationCount; ++i) {
        const row = randomListItem(json.rows);
        const video = randomListItem(row.videos);

        video.runningTime += 1;
    }
}
