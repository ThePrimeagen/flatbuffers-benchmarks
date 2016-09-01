const runLolomoAsService = require('./run-lolomo-as-a-service');
const request = require('./request');
const programArgs = require('../../../programArgs');
const Generator = require('../../../data/index');
const LolomoGenerator = Generator.LolomoGenerator;
const Lolomo = require('../../../data/lolomo_generated').Netflix.Lolomo;
const rootFn = Lolomo.getRootAsLolomo;

const host = programArgs.host;
const port = programArgs.port;
const opts = {
    host: host,
    port: port
};
const isJSON = programArgs.isJSON;

runLolomoAsService(function _onServer() {
    request(opts, respondToServer(), isJSON, rootFn, function _res(e, data) {
        console.log('FINISHED', e);
        if (isJSON) {
            console.log(data);
        }
        else {
            LolomoGenerator.printFBS(data);
        }
        process.exit(e);
    });
});

function respondToServer(chunk) {

    const isJSON = programArgs.isJSON;
    const rows = programArgs.rows;
    const columns = programArgs.columns;
    const isGraph = programArgs.isGraph;
    const percentSimilar = programArgs.percentSimilar;
    const clientId = programArgs.clientId;
    const request = LolomoGenerator.createRequest(
        clientId, rows, columns, percentSimilar, isGraph, isJSON);
    
    // No need to serialize json, that is done by the restify server
    const buffer = isJSON ? request : new Buffer(request);
    return buffer;
}



