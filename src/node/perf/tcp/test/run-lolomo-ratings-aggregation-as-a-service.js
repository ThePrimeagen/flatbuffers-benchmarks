'use strict';

const net = require('net');

const buildClient = require('./buildClient');
const programArgs = require('../../../programArgs');
const FramingStream = require('../FramingStream');
const TFramingStream = require('../TFramingStream');
const LolomoStream = require('../LolomoStream');
const RatingsStream = require('../RatingsStream');
const BufferReportStream = require('../BufferReportStream');
const LogMetricsStream = require('../LogMetricsStream');
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

function runWhenReady(lolomoClient, ratingsClient, pipeLolomo, pipeRatings) {
    if (!lolomoClient || !ratingsClient) {
        return;
    }

    const opts = {
        host: programArgs.host,
        port: programArgs.port
    };

    const server = net.createServer(function _onServerConnection(socket) {

        const lolomoStream = new LolomoStream(lolomoClient);
        const ratingsStream = new RatingsStream(ratingsClient);
        socket.
            pipe(new TFramingStream()).
            pipe(new ParseStream(rootRequest)).
            pipe(lolomoStream).
            pipe(ratingsStream).
            pipe(new LogMetricsStream()).
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
