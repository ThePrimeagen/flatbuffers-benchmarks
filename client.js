'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const FramingStream = require('./FramingStream');
const REPORT = process.env.REPORT || false;

module.exports = function _client(host, port, responder) {
    const opts = {
        port: port,
        host: host
    };

    const client = net.connect(opts, function _onClientConnection() {
        const clientFramer = new FramingStream(client);

        clientFramer.on('data', function _onClientData(chunk) {
            const res = responder.fn(client, chunk);
            if (!res) {
                if (REPORT && responder.report) {
                    responder.report(chunk);
                }

                client.end();
            }
        });

        responder.fn(clientFramer, null);
    });
}
