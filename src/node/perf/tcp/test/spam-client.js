'use strict';
const http = require('http');

const programArgs = require('../../../programArgs');

const rows = programArgs.rows;
const columns = programArgs.columns;
const isJSON = programArgs.isJSON;
const curlTimes = programArgs.curlTimes;
const clientId = programArgs.clientId;
const host = programArgs.host;
const port = programArgs.port;

function makeRequest() {
    let count = 0;
    const path = `/?clientId=${clientId}&rows=${rows}&columns=${columns}&` +
                 `isJSON=${isJSON}`;
    const options = {
        host: host,
        port: port,
        path: path
    };

    console.log('Options', options);

    return function _innerRequest() {
        if (count >= curlTimes) {
            console.log('done');
            return;
        }

        count++;
        const req = http.request(options, _innerRequest);
        req.end();
    };
}


makeRequest()();


