'use strict';

const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const wss = new WebSocketServer({port: 1337});

wss.on('connection', function connection(socket) {
    socket.on('message', function incoming(message) {
        socket.send('hello from server');
    });

    socket.on('close', function closeServer() {
        wss.close();
    });
});

const ws = new WebSocket('ws://localhost:1337');

ws.on('open', function onOpen() {
    ws.send('hello from client');
});

let count = 0;
ws.on('message', function message(message) {
    count++;
    if (count < 10000) {
        return ws.send('hello from client');
    }

    ws.close();
});
