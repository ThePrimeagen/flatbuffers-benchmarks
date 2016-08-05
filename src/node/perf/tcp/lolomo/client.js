'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const fs = require('fs');

const FramingStream = require('./../FramingStream');
const reportTime = require('./../reportTime');
const booleanFromProcess = require('../../../booleanFromProcess');

const jsonResponder = require('./respond-json');
const fbsResponder = require('./respond-fbs');
const limiter = require('./../limiter');
const client = require('./client');
const programArgs = require('../../../programArgs');

console.log('Args', programArgs);

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
                    complete([chunk.length, end]);
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

// If this is a file that is ran, then open the client.
if (require.main === module) {
    const reporter = programArgs.isJSON ?
        jsonResponder.report : fbsResponder.report;
    let responder = programArgs.isJSON ?
        jsonResponder.responder : fbsResponder.responder;

    responder = limiter(programArgs.opsCount, responder);

    _client(programArgs.host, programArgs.port, responder, reporter);
}
