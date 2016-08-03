'use strict';

const jsonResponder = require('./respond-json');
const fbsResponder = require('./respond-fbs');
const limiter = require('./../limiter');

const PORT = process.env.PORT || 33000;
const HOST = process.env.HOST || 'localhost';
const IS_SERVER = booleanFromProcess(process.env.IS_SERVER, true);
const IS_JSON = booleanFromProcess(process.env.IS_JSON, true);
const IS_CLIENT = !IS_SERVER;
const MAX_COUNT = process.env.MAX_COUNT || 1000;

console.log('isServer', IS_SERVER, typeof IS_SERVER);

if (typeof IS_SERVER === 'string') {
    isServer = IS_SERVER === 'true';
}

let responder = null;
let reporter = null;
if (IS_JSON) {
    responder = jsonResponder.fn;
    reporter = jsonResponder.report;
}

else {
    responder = fbsResponder.fn;
    reporter = fbsResponder.report;
}

if (IS_SERVER) {
    require('./../server')(HOST, PORT, {fn: responder, report: reporter});
}

else {
    responder = limiter(MAX_COUNT, responder);
    require('./../client')(HOST, PORT, {fn: responder, report: reporter});
}

function booleanFromProcess(value, def) {
    console.log('Value', value, def);
    if (value === undefined) {
        return def;
    }

    if (typeof value === 'string') {
        return value === 'true';
    }

    return value;
}
