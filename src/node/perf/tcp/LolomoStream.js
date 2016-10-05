'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const AsAService = require('./AsAService');
const Lolomo = require('../../data/lolomo_generated').Netflix.Lolomo;
const TCPWrapper = require('./TCPWrapper');

const objectMode = {objectMode: true};

const LolomoStream = function _LolomoStream(lolomoClient) {
    Transform.call(this, objectMode);
    this._lolomoClient = lolomoClient;
};

module.exports = LolomoStream;

inherits(LolomoStream, Transform);

LolomoStream.prototype.onData = function onData(memo, data) {
    const isJSON = memo.isJSON;
    const clientId = _getId(memo.parsed, isJSON)

    memo.lolomo = data.parsed;
    memo.lolomoRaw = data.original;

    // Pushes the memo object to the next client.
    self.push(memo);
};

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

    this._lolomoClient.write(chunk.original, chunk, this);

    cb();
};

LolomoStream.prototype._flush = function _flush() { };

function _getId(parsed, isJSON) {
    return isJSON ? parsed.clientId : parsed.clientId();
}
