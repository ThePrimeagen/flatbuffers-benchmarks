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

function _client(host, port, responder, reporter) {
    const opts = {
        port: port,
        host: host
    };

    let start, end;
    const client = net.connect(opts, function _onClientConnection() {
        start = process.hrtime();
        const clientFramer = new FramingStream(client);

        clientFramer.on('data', function _onClientData(chunk) {
            const res = responder(client, chunk);
            if (!res) {
                if (programArgs.report && reporter) {
                    reporter(chunk);
                }

                end = process.hrtime();
                reportTime(start, end);
                console.log('Final Chunk Size', chunk.length);

                client.end();
            }
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

    responder = limiter(programArgs.maxCount, responder);

    _client(programArgs.host, programArgs.port, responder, reporter);
}
