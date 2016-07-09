'use strict';

const jsonResponder = require('./json-example');
const limiter = require('./../limiter');

const PORT = process.env.PORT || 33000;
const HOST = process.env.HOST || 'localhost';
const IS_SERVER = process.env.IS_SERVER || true;
const MAX_COUNT = process.env.MAX_COUNT || 1000;
const IS_JSON = process.env.IS_JSON || true;

console.log('isServer', IS_SERVER, typeof IS_SERVER);

let isServer = true;
if (typeof IS_SERVER === 'string') {
    isServer = IS_SERVER === 'true';
}
const isClient = !isServer;

let responder = null;
if (IS_JSON) {
    responder = jsonResponder;
}

if (isClient) {
    responder = limiter(MAX_COUNT, responder);
}

console.log('About to start', isServer, typeof isServer);
if (isServer) {
    require('./../server')(HOST, PORT, responder);
}

else {
    require('./../client')(HOST, PORT, responder);
}
