'use strict';

const flatstr = require('flatstr');

const Generator = require('../../../data');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const AsAService = require('../AsAService');
const random = require('../../../data/random');
const LolomoRequest = Generator.LolomoRequest;
const Cache = require('../Cache');
const programArgs = require('../../../programArgs');

const cache = new Cache();
const compress = programArgs.compress;

function responder(client, buffer) {
    AsAService.parse(buffer, LolomoRequest.getRootAsLolomoRequest, false,
                     function _parsed(e, lolomoRequest) {
        const isJSON = AsAService.isJSONRequest(buffer);
        const clientId = isJSON ? lolomoRequest.clientId :
                             lolomoRequest.clientId();
        const rows = isJSON ? lolomoRequest.rows : lolomoRequest.rows();
        const columns = isJSON ? lolomoRequest.columns :
                             lolomoRequest.columns();
        const requestLength = rows * columns;
        const key = getCacheKey(rows, columns, isJSON);
        let data = cache.get(clientId, key);

        if (!data) {
            data = buildLolomo(lolomoRequest, clientId, isJSON);
            cache.insert(clientId, key, data);
        }

        AsAService.write(client, data, isJSON, compress);
    });
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
