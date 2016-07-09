'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const FramingStream = require('./FramingStream');

module.exports = function _client(host, port, responder) {
    const opts = {
        port: port,
        host: host
    };

    const client = net.connect(opts, function _onClientConnection() {
        const clientFramer = new FramingStream(client);

        clientFramer.on('data', function _onClientData(chunk) {
            const res = responder(client, chunk);
            if (!res) {
                client.end();
            }
        });


        responder(clientFramer, null);
    });
}
