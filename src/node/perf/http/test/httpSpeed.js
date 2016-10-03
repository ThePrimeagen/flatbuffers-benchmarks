'use strict';

const http = require('http');

const binaryContentType = 'application/octet-stream';
const contentTypeKey = 'content-type';

const server = http.
    createServer(function _onResponse(req, res) {
        res.statusCode = 200;
        res.setHeader(contentTypeKey, binaryContentType);
        res.write(new Buffer('hello from client'));
        res.end();
    });

server.listen({host: 'localhost', port: 1337}, function _serverStart(e) {
    console.log('server start', e);
});

function _makeRequest(opts, counter) {
    if (counter > 10000) {
        server.close();
        return;
    }

    const req = http.request(opts, function _onData(res) {
        _makeRequest(opts, counter + 1);
    });
    req.end();
}
_makeRequest({port: 1337, host: 'localhost'}, 0);

