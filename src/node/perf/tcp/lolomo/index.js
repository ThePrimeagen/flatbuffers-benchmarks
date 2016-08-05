'use strict';

const fs = require('fs');
const path = require('path');

const programArgs = require('../../../programArgs');
const client = require('./client');
const server = require('./server');
const reportTime = require('./../reportTime');
const jsonResponder = require('./respond-json');
const fbsResponder = require('./respond-fbs');
const limiter = require('../limiter');
const type = programArgs.isJSON ? 'j' : 'b';

// We do not care if it was a success or not, because if it errors, its
// because we have already created it.
fs.mkdir(results(), function _afterMkDir() {
    const host = programArgs.host;
    const port = programArgs.port;
    server(host, port, getResponder(), function _onServer(e) {
        if (e) {
            console.log('ERROR', e);
            process.exit(1);
        }

        function runClient(rows) {
            console.log('starting client');

            // naughty, naughty!
            programArgs.rows = rows;

            client(host, port, getResponder(true), null, function _onComplete(time) {
                const timeTakenMS = time[0] * 1000 + time[1] / 1000000;
                fs.writeFileSync(results('client.' + rows), timeTakenMS);

                console.log('client stopped', rows, timeTakenMS);
                rows += rows === 1 ? 3 : 4;

                // we only run up to 40 rows.
                if (rows > 40) {
                    console.log('Ending sim');
                    process.exit(0);
                }

                console.log('waiting to run next test');
                setTimeout(function _wait() {
                    console.log('Running next test');
                    runClient(rows);
                }, 1000);
            });
        }

        runClient(1);
    });
});

function results(file) {
    if (!file) {
        return path.join(__dirname, 'results');
    }
    return path.join(__dirname, 'results', file);
}

function getResponder(limit) {
    let responder = programArgs.isJSON ?
        jsonResponder.responder : fbsResponder.responder;
    if (limit) {
        responder = limiter(programArgs.opsCount, responder);
    }
    return responder;
}

