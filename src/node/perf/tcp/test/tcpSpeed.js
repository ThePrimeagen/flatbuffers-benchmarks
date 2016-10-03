'use strict';

const net = require('net');

const server = net.
    createServer(function _onServerConnection(socket) {
        socket.
            on('data', function _onServerData() {
                return socket.write(new Buffer('hello from client'));
            });
    }).
    on('error', function _onServerError(e) {
        console.log('Server#Error', e);
    }).
    on('complete', function _onCompleted() {
        console.log('TCP Server connection completed');
        server.close();
    });

server.listen(1337, function _serverStart(e) {
    console.log('server start', e);
});

let count = 0;
const opts = {port: 1337, host: 'localhost'};
const client = net.connect(opts, function _onConnection() {
    client.
        on('data', function _onData(chunk) {
            count++;
            if (count < 10000) {
                return client.write(new Buffer('hello from client'));
            }

            client.close();
        }).
        on('error', function _e(e) {
            console.log('client.error', e);
        });
    client.write(new Buffer('hello from client'));
});

