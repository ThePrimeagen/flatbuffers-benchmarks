'use strict';
const net = require('net');
const flatstr = require('flatstr');

const data = require('../../../data/');
const LolomoGenerator = require('../../../data/LolomoGenerator');
const programArgs = require('../../../programArgs');
const AsAService = require('../AsAService');
const Netflix = require('../../../data/lolomo_generated').Netflix;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const Lolomo = Netflix.Lolomo;

const rows = programArgs.rows;
const columns = programArgs.columns;
const isJSON = programArgs.isJSON;
const curlTimes = programArgs.curlTimes;
const clientId = programArgs.clientId;
const host = programArgs.host;
const port = programArgs.port;
const percentSimilar = programArgs.percentSimilar;
const isGraph = programArgs.isGraph;

let count = 0;
const options = {
    host: host,
    port: port
};

console.log('Options', options);

const lolomoRequest = getLolomoRequest(rows, columns, percentSimilar, isGraph,
                                       clientId, isJSON);
const client = net.connect(opts, function _onConnection() {
    client.
        on('data', function _onData(chunk) {
            count++;
            if (count < 10000) {
                return client.write(lolomoRequest);
            }

            client.close();
        }).
        on('error', function _e(e) {
            console.log('client.error', e);
            process.abort(1);
        });
    client.write(lolomoRequest);
});

function getLolomoRequest(rows, columns, percentSimilar,
                          isGraph, clientId, isJSON) {

    const request = LolomoGenerator.createRequest(
        clientId, rows, columns, percentSimilar, isGraph, isJSON);

    const buffer = isJSON ? new Buffer(flatstr(JSON.stringify(request))) :
        new Buffer(request);

    return AsAService.createTransportBuffer(buffer, isJSON);
}
