'use strict';

const net = require('net');

const buildClient = require('./buildClient');
const programArgs = require('../../../programArgs');
const FramingStream = require('../FramingStream');
const TFramingStream = require('../TFramingStream');
const LolomoStream = require('../LolomoStream');
const RatingsStream = require('../RatingsStream');
const BufferReportStream = require('../BufferReportStream');
const PluckOutputStream = require('../PluckOutputStream');
const LogGrabberStream = require('../LogGrabberStream');
const ParseStream = require('../ParseStream');
const AsAService = require('../AsAService');
const Netflix = require('../../../data/lolomo_generated').Netflix;
const LolomoRequest = require('../../../data/lolomo-request_generated').Netflix.LolomoRequest;
const LolomoGenerator = require('../../../data/LolomoGenerator');
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const createServer = require('../../http/server').createSimpleServer;

const Lolomo = Netflix.Lolomo;
const rootRequest = LolomoRequest.getRootAsLolomoRequest;
const compress = programArgs.compress;

function initialize() {
    let lolomoClient = null;
    let ratingsClient = null;
    let pipeLolomo = null;
    let pipeRatings = null;

    const lHost = programArgs.lolomoHost;
    const lPort = programArgs.lolomoPort;
    const rHost = programArgs.ratingsHost;
    const rPort = programArgs.ratingsPort;

    buildClient(lHost, lPort, function _lolomoClient(err, lClient) {
        if (err) {
            throw err;
        }

        lolomoClient = lClient;
        runWhenReady(lolomoClient, ratingsClient);
    });

    buildClient(rHost, rPort, function _ratingsClient(err, rClient) {
        if (err) {
            throw err;
        }

        ratingsClient = rClient;
        runWhenReady(lolomoClient, ratingsClient, pipeLolomo, pipeRatings);
    });
}

let fbsCount = 0;
let jsonCount = 0;
let fbsVideoCount = 0;
let jsonVideoCount = 0;

setInterval(function _reportRPS() {
    console.log('port', programArgs.port);
    console.log('RPS(fbs): ', fbsCount / 10);
    console.log('RPS(json): ', jsonCount / 10);
    console.log('RPS(videos.fbs): ', fbsVideoCount / 10);
    console.log('RPS(videos.json): ', jsonVideoCount / 10);

    fbsCount = jsonCount = fbsVideoCount = jsonVideoCount = 0;
}, 10000);

function loggerClosure() {
    return function _innerLogger(data) {
        const isJSON = data.isJSON;
        const req = data.parsed;
        const rows = isJSON ? req.rows : req.rows();
        const columns = isJSON ? req.columns : req.columns();
        const count = rows * columns;

        if (isJSON) {
            jsonCount++;
            jsonVideoCount += count;
        }

        else {
            fbsCount++;
            fbsVideoCount += count;
        }
    };
}

const logger = loggerClosure();

function runWhenReady(lolomoClient, ratingsClient, pipeLolomo, pipeRatings) {
    if (!lolomoClient || !ratingsClient) {
        return;
    }

    const opts = {
        host: programArgs.host,
        port: programArgs.port
    };

    const server = net.createServer(function _onServerConnection(socket) {

        socket.
            pipe(new TFramingStream()).
            pipe(new ParseStream(rootRequest)).
            pipe(new LolomoStream(lolomoClient)).
            pipe(new RatingsStream(ratingsClient)).
            pipe(new PluckOutputStream()).
            pipe(new LogGrabberStream(logger)).
            pipe(socket).
            on('error', function _onError(e) {
                console.log('lolomo#frameError#', e);
                console.log('lolomo#frameError#', e.stack);
                process.abort(1);
            }).
            on('end', function _cleanUp() {
                lolomoStream.cleanUp();
                ratingsStream.cleanUp();
            });
    });

    server.listen(opts, function _onServerStart(e) {
        console.log('started server', e);
        if (e) {
            process.abort(1);
        }
    });
}


if (require.main === module) {
    initialize();
}
