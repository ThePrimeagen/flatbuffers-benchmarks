'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');

const FramingStream = require('../FramingStream');
const programArgs = require('../../../programArgs');

console.log('Client.Args', programArgs);

function _client(host, port, responder, reporter, complete) {
    const opts = {
        port: port,
        host: host
    };

    let start, end;
    const client = net.connect(opts, function _onClientConnection() {
        const clientFramer = new FramingStream(client);
        start = process.hrtime();

        clientFramer.on('data', function _onClientData(chunk) {
            const res = responder(client, chunk);
            if (!res) {
                if (programArgs.report && reporter) {
                    reporter(chunk);
                }
                end = process.hrtime(start);

                client.destroy();

                if (complete) {
                    complete([chunk.length, end], chunk);
                }
            }
        }).
        on('error', function _e(e) {
            console.log('client.error', e);
        });

        responder(clientFramer, null);
    });
}

module.exports = _client;
