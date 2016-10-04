'use strict';

const net = require('net');

const ratingsAsAService = require('../ratings');
const server = require('../server');
const programArgs = require('../../../programArgs');
const TFramingStream = require('../TFramingStream');
const ParseStream = require('../ParseStream');
const RatingsServiceStream = require('../ratings');
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const rootFn = RatingsRequest.getRootAsRatingsRequest;

const host = programArgs.host;
const port = programArgs.port;

function _runServer(cb) {

    console.log('creating server', host, port);
    const server = net.
        createServer(function _onServerConnection(socket) {
            socket.
                pipe(new FramingStream()).
                pipe(new ParseStream(rootFn)).
                pipe(new RatingsServiceStream()).
                pipe(socket);
        }).
        on('error', function _onServerError(e) {
            console.log('RatingsAsAService#Error', e.message);
            console.log('RatingsAsAService#Error', e.stack);
        }).
        on('complete', function _onCompleted() {
            console.log('TCP RatingsAsAService completed');
        });


    // TODO: HOST?
    server.listen(port, function _serverStart(e) {
        if (cb) {
            cb(e);
        }
    });
}

module.exports = _runServer;

if (require.main === module) {
    _runServer();
}

