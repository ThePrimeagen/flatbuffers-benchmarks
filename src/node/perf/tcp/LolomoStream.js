'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const AsAService = require('./AsAService');
const Lolomo = require('../../data/lolomo_generated').Netflix.Lolomo;
const TFramingStream = require('./TFramingStream');
const ParseStream = require('./ParseStream');

const objectMode = {objectMode: true};
const rootLolomo = Lolomo.getRootAsLolomo;

const LolomoStream = function _LolomoStream(lolomoClient) {
    Transform.call(this, objectMode);
    this._lolomoClient = lolomoClient;

    const idMap = this._idMap = {};
    const self = this;

    lolomoClient.
        pipe(new TFramingStream()).
        pipe(new ParseStream(rootLolomo)).
        on('data', function _onLolomoData(data) {
            const isJSON = data.isJSON;
            const clientId = _getId(data.parsed, isJSON)
            const request = idMap[clientId];

            if (!request) {
                throw new Error(`request does not exist for LolomoStream for ${clientId}`);
            }

            request.lolomo = data.parsed;
            request.lolomoRaw = data.original;

            // Pushes the request object to the next client.
            self.push(request);
            idMap[clientId] = undefined;
        }).
        on('error', function _onLolomoData(e) {
            console.log('lolomoClient#lolomoStream#error', e.message, e.stack);
        }).
        on('complete', function _onLolomoData() {
            console.log('lolomoClient#lolomoStream#complete');
        });
};

module.exports = LolomoStream;

inherits(LolomoStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean,
 *     clientId: null
 * }} chunk - The chunked data from the framing stream
 */
LolomoStream.prototype._transform = function _transform(chunk, enc, cb) {

    const lolomoRequest = chunk.parsed;
    const isJSON = chunk.isJSON;
    const clientId = chunk.clientId = _getId(chunk.parsed, isJSON);

    if (this._idMap[clientId]) {
        throw new Error(`This clientId ${clientId} is already in use`);
    }

    this._idMap[clientId] = chunk;

    // Pass-through for the lolomoClient from the original request from the
    // user.
    this._lolomoClient.write(chunk.original);
    cb();
};

LolomoStream.prototype._flush = function _flush() { };

function _getId(parsed, isJSON) {
    return isJSON ? parsed.clientId : parsed.clientId();
}
