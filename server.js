'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const FramingStream = require('./FramingStream');

module.exports = function createServer(host, port, responder) {
    const server = net.
        createServer(function _onServerConnection(socket) {

            const framer = new FramingStream(socket);
            framer.
                on('data', function _onClientData(chunk) {
                    responder(framer, chunk);
                });
        }).
        on('error', function _onServerError(e) {
            console.log('error', e);
        });


    // TODO: HOST?
    server.listen(port, function _serverStart() {
        console.log('server started');
    });
};
