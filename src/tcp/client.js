'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const fs = require('fs');

const FramingStream = require('./FramingStream');
const reportTime = require('./reportTime');
const REPORT = process.env.REPORT || false;

module.exports = function _client(host, port, responder) {
    const opts = {
        port: port,
        host: host
    };

    let start, end;
    const client = net.connect(opts, function _onClientConnection() {
        start = process.hrtime();
        const clientFramer = new FramingStream(client);

        clientFramer.on('data', function _onClientData(chunk) {
            const res = responder.fn(client, chunk);
            if (!res) {
                if (REPORT && responder.report) {
                    responder.report(chunk);
                }

                end = process.hrtime();
                reportTime(start, end);
                console.log('Final Chunk Size', chunk.length);

                client.end();
            }
        });

        responder.fn(clientFramer, null);
    });
}
