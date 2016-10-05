'use strict';

const net = require('net');

const ratingsAsAService = require('../ratings');
const server = require('../server');
const programArgs = require('../../../programArgs');
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const TFramingStream = require('./TFramingStream');
const ParseStream = require('./ParseStream');
const rootFn = RatingsRequest.getRootAsRatingsRequest;

const host = programArgs.host;
const port = programArgs.port;

function _runServer(cb) {
    const server = net.
        createServer(function _onServerConnection(socket) {
            socket.
                pipe(new FramingStream()).
                pipe(new ParseStream(rootFn)).
                pipe
            framer.
                on('data', function _onClientData(chunk) {
                    responder(framer, chunk);
                }).
                on('error', function _error(e) {
                    console.log('framer#Error', e);
                });
        }).
        on('error', function _onServerError(e) {
            console.log('Server#Error', e);
        }).
        on('complete', function _onCompleted() {
            console.log('TCP Server connection completed');
        });


    server.listen(port, function _serverStart(e) {
        console.log('server start', e);
        if (onServer) {
            onServer(e);
        }
    });
}

module.exports = _runServer;

if (require.main === module) {
    _runServer();
}

