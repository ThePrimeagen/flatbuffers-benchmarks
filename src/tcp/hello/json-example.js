'use strict';

const hiCount = process.env.HI_COUNT || 10;
const percentToMutate = process.env.PERCENT_MUTATION || 0.25;
const mutateAmount = Math.ceil(hiCount * percentToMutate);
const DataGenerator = require('./../../generator').DataGenerator;

var _recieveJSON = function _recieveJSON(client, jsonOrBuffer) {
    let json = jsonOrBuffer;

    // create an object.
    if (jsonOrBuffer instanceof Buffer) {
        json = JSON.parse(jsonOrBuffer.toString());
    }

    else if (!jsonOrBuffer) {
        json = buildHellos();
    }

    mutateRandomHi(json);
    writeToClient(json, client);
}

function report(chunk) {
    console.log(chunk.toString());
}

module.exports = {
    fn: _recieveJSON,
    report: report
}

function buildHellos() {

    const hiList = [];
    const hellos = {
        hiList: hiList
    };
    const gen = new DataGenerator();

    for (let i = 0; i < hiCount; ++i) {
        const convo = gen.getRandomString(250);
        const hi = {
            type: 'hello',
            conversation: convo,
            count: 1
        };

        hiList.push(hi);
    }

    return hellos;
}

function writeToClient(json, writer) {
    const jsonStr = JSON.stringify(json);
    const buf = new Buffer(4);
    const bufStr = new Buffer(jsonStr);

    buf.writeUInt32LE(bufStr.length, 0);

    const outBuf = Buffer.concat([buf, bufStr]);

    writer.write(outBuf);
}

function mutateRandomHi(hellos) {

    const len = hellos.hiList.length;
    for (let i = 0; i < mutateAmount; ++i) {
        const rIndex = Math.floor(Math.random() * len);
        const hi = hellos.hiList[rIndex];

        hi.count++;
    }
}
