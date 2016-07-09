'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const PORT = process.env.PORT || 33000;
const Hello = require('./hello_generated');
const flatbuffers = require('./flatbuffers').flatbuffers;
const FramingStream = require('./FramingStream');
const _responder = require('./responder.js')();

const server = net.
    createServer(function _onServerConnection(socket) {

        const framer = new FramingStream(socket);
        framer.
            on('data', function _onClientData(chunk) {
                _responder(framer, chunk);
            });
    }).
    on('error', function _onServerError(e) {
        console.log('error', e);
    });


server.listen(PORT, function _serverStart() {
    console.log('server started');
});
