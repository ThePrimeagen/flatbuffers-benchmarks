'use strict';

const lolomoAsAService = require('../lolomo');
const server = require('../server');
const programArgs = require('../../../programArgs');

const host = programArgs.host;
const port = programArgs.port;

function _runServer(cb) {
    server(host, port, lolomoAsAService, function _onServer(e) {
        if (e) {
            console.log('ERROR', e);
            process.exit(1);
        }
        if (cb) {
            cb();
        }
    });
}

module.exports = _runServer;

if (require.main === module) {
    _runServer();
}
