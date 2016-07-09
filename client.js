'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');
const PORT = process.env.PORT || 33000;
const HOST = process.env.HOST || 'localhost';
const jsonProcessor = require('./json');
const isJSON = process.env.IS_JSON || true;
const Hello = require('./hello_generated');
const flatbuffers = require('./flatbuffers').flatbuffers;
const FramingStream = require('./FramingStream');
const opts = {
    port: PORT,
    host: HOST
};
const _responder = require('./responder.js')(true);

const client = net.connect(opts, function _onClientConnection() {
    const clientFramer = new FramingStream(client);

    clientFramer.on('data', function _onClientData(chunk) {
        _responder(client, chunk);
    });

    if (isJSON) {
        const startValue = {
            type: 'hello',
            count: -1
        };

        _responder(client, startValue);
    }
});
