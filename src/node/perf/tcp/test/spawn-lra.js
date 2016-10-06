const child_process = require('child_process');
const path = require('path');
const programArgs = require('../../../programArgs');

const spawn = child_process.spawn;
const spawnCount = programArgs.spawnCount;
const port = programArgs.port;
const pathToLRA = path.join(__dirname, 'run-lolomo-ratings-aggregation-as-a-service.js');
const dataArray = new Array(spawnCount);
const basePort = programArgs.port;
let port = basePort;
let lolomoPort = programArgs.getLolomoPort();
let ratingsPort = programArgs.getRatingsPort();
let jsonVideos = 0;
let jsonRequests = 0;
let fbsVideos = 0;
let fbsRequests = 0;

for (let i = 0; i < spawnCount; ++i) {
    const args = [
        pathToLRA,
        '--usePort=true',
        '--port=' + port,
        '--lolomoPort=' + lolomoPort,
        '--ratingsPort=' + ratingsPort
    ];

    console.log('node', args.join(' '));
    const stream = spawn('node', args);

    stream.
        on('data', storeData(port - basePort)).
        on('error', onError(port, lolomoPort, ratingsPort)).
        on('end', onEnd(port, lolomoPort, ratingsPort)).

    port++;
    lolomoPort++;
    ratingsPort++;
}

function onError(port, lolomoPort, ratingsPort) {
    return function _innerOnError(e) {
        console.log();
        console.log();
        console.log();
        console.log('Failure for LRA', port, lolomoPort, ratingsPort);
        console.log('---', e.message);
        console.log('---', e.stack);
        console.log();
        console.log();
        console.log();
    };
}

function onEnd(port, lolomoPort, ratingsPort) {
    return function _innerOnError(e) {
        console.log();
        console.log();
        console.log();
        console.log('END OF LRA', port, lolomoPort, ratingsPort);
        console.log();
        console.log();
        console.log();
    };
}

function storeData(index) {
    return function _storeData(x) {
        dataArray[index] = x;
        if (shouldReport()) {
            reportData();
        }
    };
}

// Resets the data array and reports all of the data.
function reportData() {
    dataArray = dataArray.
        forEach(onData).
        map(function _toUndefined() { return undefined; });

    console.log('-- Lolomo Ratings Aggregation -- ');
    console.log([jsonRequests, jsonVideos, fbsRequests, fbsVideos]);

    fbsRequests = fbsVideos = jsonRequests = jsonVideos = 0;
}

function shouldReport() {
    let should = true;
    for (let i = 0; i < spawnCount && should; ++i) {
        should = !!dataArray[i];
    }

    return should;
}

function onData(data) {
    if (data instanceof Buffer) {
        data = data.toString();
    }

    data.
        split('\n').
        filter(function _eachLine(x) {
            return x.indexOf('RPS(') >= 0;
        }).
        map(function _getValues(x) {
            const isFBS = x.indexOf('fbs') >= 0;
            const isVideos = x.indexOf('videos') >= 0;
            if (isFBS) {
                if (isVideos) {
                    return ['fVideos', Number(x.slice(18))];
                }
                return ['fRequests', Number(x.slice(11))];
            }
            if (videos) {
                return ['jVideos', Number(x.slice(19))];
            }
            return ['jRequests', Number(x.slice(12))];
        }).
        forEach(function _incrementValues(x) {
            switch (x[0]) {
                case 'jVideos':
                    jsonVideos += x[1];
                    break;
                case 'jRequests':
                    jsonRequests += x[1];
                    break;
                case 'fVideos':
                    fbsVideos += x[1];
                    break;
                case 'fRequests':
                    fbsRequests += x[1];
                    break;
            }
        });
}

