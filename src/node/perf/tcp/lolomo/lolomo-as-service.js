'use strict';

const Generator = require('../../../generator');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const AsAService = require('../AsAService');
const random = require('../../../generator/random');
const Lolomo = Generator.NetflixFBS.Lolomo;
const LolomoRequest = Generator.LolomoRequest;
const lolomoCache = {};

function responder(client, buffer) {
    const isJSON = AsAService.isJSONRequest(buffer);
    const lolomoRequest = AsAService.parse(buffer, Lolomo.getRootAsLolomo);
    const clientId = isJSON ? lolomoRequest.clientId : lolomoRequest.clientId();
    let data = getCache(clientId);

    if (!data) {
        data = buildLolomo(lolomoRequest, isJSON);
        insertIntoCache(data, clientId, isJSON);
    }

    const outBuf = toBuffer(data, isJSON);
    client.write(AsAService.createTransportBuffer(outBuf, isJSON));
}

module.exports = responder;

function getCache(clientId, isJSON) {
    const clientCache = lolomoCache[clientId];
    if (clientCache) {
        return isJSON ? clientCache.json : clientCache.fbs;
    }
    return null;
}

function insertIntoCache(data, clientId, isJSON) {
    let cache = lolomoCache[clientId];
    if (!cache) {
        cache = lolomoCache[clientId] = {};
    }

    const key = isJSON ? 'json' : 'fbs';
    console.log('client', cache[key]);
    cache[key] = data;
}

function toBuffer(lolomo, isJSON) {
    if (isJSON) {
        return new Buffer(JSON.stringify(lolomo));
    }

    return new Buffer(lolomo);
}

function buildLolomo(request, isJSON) {
    const gen = new LolomoGenerator();
    const rows = isJSON ? request.rows : request.rows();
    const columns = isJSON ? request.columns : request.columns();
    const percentSimilar = isJSON ?
        request.percentSimilar : request.percentSimilar();
    const isGraph = isJSON ? request.isGraph : request.isGraph();

    let buffer = null;
    if (isJSON) {
        return gen.getLolomoAsJSON(rows, columns, percentSimilar, isGraph);
    }
    const bytes = gen.getLolomoAsFBS(rows, columns, percentSimilar, isGraph);
    return bytes;
}

