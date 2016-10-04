'use strict';

const net = require('net');

const ratingsAsAService = require('../ratings');
const programArgs = require('../../../programArgs');
const TFramingStream = require('../TFramingStream');
const BufferReportStream = require('../BufferReportStream');
const ParseStream = require('../ParseStream');
const LolomoServiceStream = require('../lolomo');
const LolomoRequest = require('../../../data/lolomo-request_generated').Netflix.LolomoRequest;
const rootFn = LolomoRequest.getRootAsLolomoRequest;

const host = programArgs.host;
const port = programArgs.port;

function _runServer(cb) {

    console.log('creating server', host, port);
    const server = net.
        createServer(function _onServerConnection(socket) {
            socket.
//                pipe(new BufferReportStream('Raw')).
                pipe(new TFramingStream()).
 //               pipe(new BufferReportStream('After Framing')).
                pipe(new ParseStream(rootFn)).
  //              pipe(new BufferReportStream('After Parsing')).
                pipe(new LolomoServiceStream()).
   //             pipe(new BufferReportStream('After LolomoServiceStream')).
                pipe(socket);
        }).
        on('error', function _onServerError(e) {
            console.log('LolomoAsAService#Error', e.message);
            console.log('LolomoAsAService#Error', e.stack);
        }).
        on('complete', function _onCompleted() {
            console.log('TCP LolomoAsAService completed');
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
    _runServer(function _callback(e) {
        if (e) {
            console.log('aborting on', e.message);
            console.log('aborting on', e.stack);
            process.abort(1);
        }
    });
}

