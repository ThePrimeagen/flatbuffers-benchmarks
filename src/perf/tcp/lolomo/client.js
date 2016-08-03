'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const fs = require('fs');

const FramingStream = require('./../FramingStream');
const reportTime = require('./../reportTime');
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

const jsonResponder = require('./respond-json');
const fbsResponder = require('./respond-fbs');
const limiter = require('./../limiter');
const client = require('./client');
const server = require('./server');
const booleanFromProcess = require('../../../booleanFromProcess');

const PORT = process.env.PORT || 33000;
const HOST = process.env.HOST || 'localhost';
const IS_JSON = booleanFromProcess(process.env.IS_JSON, true);
const MAX_COUNT = process.env.MAX_COUNT || 1000;

// If this is a file that is ran, then open the client.
if (require.main === module) {
    let responder = IS_JSON ? jsonResponder.fn : fbsResponder.fn;
    let reporter = IS_JSON ? jsonResponder.report : fbsResponder.report;

    responder = limiter(MAX_COUNT, responder);
    
    _client(HOST, PORT, {fn: responder, report: reporter});
}
