'use strict';

const Generator = require('../../../data');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const AsAService = require('../AsAService');
const random = require('../../../data/random');
const LolomoRequest = Generator.LolomoRequest;
const Cache = require('../Cache');
const cache = new Cache();


let fbsCount = 0;
let jsonCount = 0;
let fbsVideoCount = 0;
let jsonVideoCount = 0;
const intervalId = setInterval(function _reportRPS() {
    console.log('RPS(fbs): ', fbsCount / 10);
    console.log('RPS(json): ', jsonCount / 10);
    console.log('RPS(videos.fbs): ', fbsVideoCount / 10);
    console.log('RPS(videos.json): ', jsonVideoCount / 10);

    fbsCount = jsonCount = fbsVideoCount = jsonVideoCount = 0;
}, 10000);

function responder(client, buffer) {
    const isJSON = AsAService.isJSONRequest(buffer);
    const lolomoRequest = AsAService.parse(buffer, LolomoRequest.getRootAsLolomoRequest);
    const clientId = isJSON ? lolomoRequest.clientId : lolomoRequest.clientId();
    const type = getJSONOrFBSKey(isJSON);
    let data = cache.get(clientId, type);
    
    if (!data) {
        data = buildLolomo(lolomoRequest, clientId, isJSON);
        cache.insert(clientId, type, data);
    }

    const requestLength = isJSON ? lolomoRequest.rows * lolomoRequest.columns : 
                                   lolomoRequest.rows() * lolomoRequest.columns();

    // Reporting
    if (isJSON) {
        jsonCount++;
        jsonVideoCount += requestLength;
    }

    else {
        fbsCount++;
        fbsVideoCount += requestLength;
    }

    const outBuf = toBuffer(data, isJSON);
    client.write(AsAService.createTransportBuffer(outBuf, isJSON));
}

module.exports = responder;

function toBuffer(lolomo, isJSON) {
    if (isJSON) {
        return new Buffer(JSON.stringify(lolomo));
    }

    return new Buffer(lolomo);
}

function buildLolomo(request, clientId, isJSON) {
    const gen = new LolomoGenerator();
    const rows = isJSON ? request.rows : request.rows();
    const columns = isJSON ? request.columns : request.columns();
    const percentSimilar = isJSON ?
        request.percentSimilar : request.percentSimilar();
    const isGraph = isJSON ? request.isGraph : request.isGraph();

    let buffer = null;
    if (isJSON) {
        return gen.getLolomoAsJSON(rows, columns, percentSimilar, isGraph, clientId);
    }
    const bytes = gen.getLolomoAsFBS(rows, columns, percentSimilar, isGraph, clientId);
    return bytes;
}

function getJSONOrFBSKey(isJSON) {
    return isJSON ? 'json' : 'fbs';
}
