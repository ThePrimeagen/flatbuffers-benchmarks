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
        start = process.hrtime();

        const framer = new FramingStream(client);
        framer.
            on('data', function _onClientData(chunk) {
                const res = responder(framer, chunk);
                if (!res) {
                    if (programArgs.report && reporter) {
                        reporter(chunk);
                    }
                    end = process.hrtime(start);

                    if (complete) {
                        complete([chunk.length, end], chunk);
                    }
                }
            }).
            on('error', function _e(e) {
                console.log('client.error', e);
            });

        responder(framer, null);
    });
}

module.exports = _client;
