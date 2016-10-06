const child_process = require('child_process');
const path = require('path');
const programArgs = require('../../../programArgs');

const spawn = child_process.spawn;
const spawnCount = programArgs.spawnCount;
const port = programArgs.port;
const pathToRatings = path.join(__dirname, 'run-ratings-as-a-service.js');
const pathToLolomo = path.join(__dirname, 'run-lolomo-as-a-service.js');
const port = programArgs.port;
const fileToUse = programArgs.spawnProgram === 'lolomo' ? pathToLolomo :
    pathToRatings;

for (let i = 0; i < spawnCount; ++i) {
    const args = [
        fileToUse,
        '--port=' + port
    ];

    console.log('node', args.join(' '));
    const stream = spawn('node', args);

    stream.
        on('data', storeData(port - basePort)).
        on('error', onError(port, lolomoPort, ratingsPort)).
        on('end', onEnd(port, lolomoPort, ratingsPort)).

    port++;
}

function onError(port) {
    return function _innerOnError(e) {
        console.log();
        console.log();
        console.log();
        console.log('Failure for', fileToUse, port);
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
        console.log('END OF ', fileToUse, port);
        console.log();
        console.log();
        console.log();
    };
}
