'use strict';

// This is the server piece to accept new, incoming
// TCP packets.
const net = require('net');

const FramingStream = require('./FramingStream');
const booleanFromProcess = require('../../booleanFromProcess');
const programArgs = require('../../programArgs');

function createServer(host, port, responder, onServer) {
    const server = net.
        createServer(function _onServerConnection(socket) {

            socket.
                pipe(new FramingStream()).
                on('data', function _onClientData(chunk) {
                    responder(socket, chunk);
                }).
                on('error', function _error(e) {
                    console.log('framer#Error', e);
                });
        }).
        on('error', function _onServerError(e) {
            console.log('Server#Error', e);
        }).
        on('complete', function _onCompleted() {
            console.log('TCP Server connection completed');
        });


    // TODO: HOST?
    server.listen(port, function _serverStart(e) {
        console.log('server start', e);
        if (onServer) {
            onServer(e);
        }
    });
};

module.exports = createServer;
