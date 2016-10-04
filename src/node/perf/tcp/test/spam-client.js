'use strict';
const net = require('net');
const flatstr = require('flatstr');
const zlib = require('zlib');

const data = require('../../../data/');
const LolomoGenerator = require('../../../data/LolomoGenerator');
const programArgs = require('../../../programArgs');
const AsAService = require('../AsAService');
const Netflix = require('../../../data/lolomo_generated').Netflix;
const flatbuffers = require('../../../flatbuffers').flatbuffers;
const FramingStream = require('../FramingStream');
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
const debug = programArgs.debug;
const compress = programArgs.compress;

let count = 0;
const options = {
    host: host,
    port: port
};

console.log('Options', JSON.stringify(programArgs, null, 4));

const lolomoRequest = getLolomoRequest(rows, columns, percentSimilar, isGraph,
                                       clientId, isJSON);
const client = net.connect(options, function _onConnection() {
    const framerStream = new FramingStream(client);
    framerStream.
        on('data', function _onData(chunk) {
            if (debug) {
                if (compress) {
                    chunk = zlib.gunzipSync(chunk);
                }

                if (isJSON) {
                    console.log(JSON.stringify(JSON.parse(chunk.toString()), null, 4));
                }
                else {
                    console.log(chunk.toString());
                }
            }
            count++;
            if (count < curlTimes) {
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
