'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;
const programArgs = require('../../programArgs');
const toBuffer = require('../../toBuffer');
const AsAService = require('./AsAService');

const objectMode = {objectMode: true};

const LogMetricsStream = function _LogMetricsStream() {
    Transform.call(this, objectMode);

    this.fbsCount = 0;
    this.jsonCount = 0;
    this.fbsVideoCount = 0;
    this.jsonVideoCount = 0;

    const self = this;
    const intervalId = setInterval(function _reportRPS() {
        console.log('port', programArgs.port);
        console.log('RPS(fbs): ', this.fbsCount / 10);
        console.log('RPS(json): ', this.jsonCount / 10);
        console.log('RPS(videos.fbs): ', this.fbsVideoCount / 10);
        console.log('RPS(videos.json): ', this.jsonVideoCount / 10);

        this.fbsCount = this.jsonCount =
            this.fbsVideoCount = this.jsonVideoCount = 0;
    }, 10000);
};


module.exports = LogMetricsStream;

inherits(LogMetricsStream, Transform);

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
LogMetricsStream.prototype._transform = function _transform(chunk, enc, cb) {

    const isJSON = chunk.isJSON;
    const req = chunk.parsed;
    const rows = isJSON ? req.rows.length : req.rowsLength();
    const columns = isJSON ? req.columns.length : req.columnsLength();
    const count = rows * columns;

    if (isJSON) {
        this.jsonCount++;
        this.jsonVideoCount += count;
    }

    else {
        this.fbsCount++;
        this.fbsVideoCount += count;
    }

    if (isJSON) {
        const buffer = toBuffer(chunk.lolomo, isJSON);
        this.push(AsAService.createTransportBuffer(buffer, isJSON));
    }
    else {
        this.push(chunk.lolomoRaw);
    }

    cb();
};

LogMetricsStream.prototype._flush = function _flush() { };

