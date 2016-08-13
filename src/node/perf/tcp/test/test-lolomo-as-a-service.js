const client = require('./client');
const runLolomoAsService = require('./run-lolomo-as-a-service');
const AsAService = require('../AsAService');
const programArgs = require('../../../programArgs');
const limiter = require('../limiter');
const Generator = require('../../../data');
const LolomoGenerator = Generator.LolomoGenerator;

const host = programArgs.host;
const port = programArgs.port;

runLolomoAsService(function _onServer() {
    const responder = limiter(1, respondToServer);
    client(host, port, responder, null, function _completed(x, chunk) {
        const res = AsAService.parse(chunk, Generator.NetflixFBS.Lolomo.getRootAsLolomo);
        console.log('Lolomo as a service responded with');
        if (AsAService.isJSONRequest(chunk)) {
            console.log(JSON.stringify(res, null, 4));
        }
        
        else {
            LolomoGenerator.printFBS(res);
        }
        process.exit(0);
    });
});

function respondToServer(writer, chunk) {

    const isJSON = programArgs.isJSON;
    const rows = programArgs.rows;
    const columns = programArgs.columns;
    const isGraph = programArgs.isGraph;
    const percentSimilar = programArgs.percentSimilar;
    const clientId = programArgs.clientId;
    const request = LolomoGenerator.createRequest(
        clientId, rows, columns, percentSimilar, isGraph, isJSON);
    
    const buffer = isJSON ? new Buffer(JSON.stringify(request)) :
                            new Buffer(request);

    writer.write(AsAService.createTransportBuffer(buffer, isJSON));
}



