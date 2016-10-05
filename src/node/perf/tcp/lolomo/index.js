'use strict';

const flatstr = require('flatstr');
const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const flatbuffers = require('../../../flatbuffers').flatbuffers;
const Generator = require('../../../data');
const random = require('../../../data/random');
const AsAService = require('../AsAService');
const Cache = require('../Cache');
const programArgs = require('../../../programArgs');
const toBuffer = require('../../../toBuffer');

const cache = new Cache();
const LolomoGenerator = Generator.LolomoGenerator;
const LolomoRequest = Generator.LolomoRequest;
const compress = programArgs.compress;

const objectMode = {objectMode: true};

const LolomoServiceStream = function _LolomoServiceStream() {
    Transform.call(this, objectMode);
};

module.exports = LolomoServiceStream;

inherits(LolomoServiceStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean
 * }} chunk - The chunked data from the framing stream
 */
LolomoServiceStream.prototype._transform = function _transform(chunk, enc, cb) {
    const isJSON = chunk.isJSON;
    const lolomoRequest = chunk.parsed;
    const clientId = isJSON ? lolomoRequest.clientId :
                            lolomoRequest.clientId();
    const rows = isJSON ? lolomoRequest.rows : lolomoRequest.rows();
    const columns = isJSON ? lolomoRequest.columns :
                            lolomoRequest.columns();
    const key = getCacheKey(rows, columns, isJSON);
    let data = cache.get(clientId, key);

    if (!data) {
        data = buildLolomo(lolomoRequest, clientId, isJSON);
        cache.insert(clientId, key, data);
    }

    this.push(AsAService.createTransportBuffer(toBuffer(data, isJSON), isJSON));

    cb();
};

LolomoServiceStream.prototype._flush = function _flush() { };

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
