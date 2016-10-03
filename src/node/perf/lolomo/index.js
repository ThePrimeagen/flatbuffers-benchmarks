'use strict';

const Generator = require('../../data');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('../../flatbuffers').flatbuffers;
const AsAService = require('../AsAService');
const AsAService = require('../AsAService');
const random = require('../../data/random');
const LolomoRequest = Generator.LolomoRequest;
const Cache = require('../Cache');
const cache = new Cache();
const programArgs = require('../../programArgs');
const toBuffer = require('../../toBuffer');

const compress = programArgs.compress;
let fbsCount = 0;
let jsonCount = 0;
let fbsVideoCount = 0;
let jsonVideoCount = 0;


const intervalId = setInterval(function _reportRPS() {
    console.log('-- Lolomo Port --', programArgs.port);
    console.log('RPS(fbs): ', fbsCount / 10);
    console.log('RPS(json): ', jsonCount / 10);
    console.log('RPS(videos.fbs): ', fbsVideoCount / 10);
    console.log('RPS(videos.json): ', jsonVideoCount / 10);

    fbsCount = jsonCount = fbsVideoCount = jsonVideoCount = 0;
}, 10000);

function responder(buffer) {
    const isJSON = AsAService.isJSONRequest(buffer);
    const lolomoRequest = AsAService.parse(buffer, LolomoRequest.getRootAsLolomoRequest);
    const clientId = isJSON ? lolomoRequest.clientId : lolomoRequest.clientId();
    const rows = isJSON ? lolomoRequest.rows : lolomoRequest.rows();
    const columns = isJSON ? lolomoRequest.columns : lolomoRequest.columns();
    const requestLength = rows * columns;
    const key = getCacheKey(rows, columns, isJSON);
    let data = cache.get(clientId, key);

    if (!data) {
        data = buildLolomo(lolomoRequest, clientId, isJSON);
        cache.insert(clientId, key, data);
    }

    // Reporting
    if (isJSON) {
        jsonCount++;
        jsonVideoCount += requestLength;
    }

    else {
        fbsCount++;
        fbsVideoCount += requestLength;
    }

    return data;
}

module.exports = responder;

function buildLolomo(request, clientId, isJSON) {
    const gen = new LolomoGenerator();
    const rows = isJSON ? request.rows : request.rows();
    const columns = isJSON ? request.columns : request.columns();
    const percentSimilar = isJSON ?
        request.percentSimilar : request.percentSimilar();

    // Flatbuffers natively support graph.  There is no reason not to consider
    // this option.
    const isGraph = isJSON ? request.isGraph : true;

    let buffer = null;
    if (isJSON) {
        return gen.getLolomoAsJSON(rows, columns, percentSimilar, isGraph,
            clientId);
    }
    const bytes = gen.getLolomoAsFBS(rows, columns, percentSimilar, isGraph,
        clientId);
    return bytes;
}

function getCacheKey(rows, cols, isJSON) {
    const type = isJSON ? 'json' : 'fbs';
    return type + '_' + rows + '_' + cols;
}
