'use strict';

const http = require('http');

// This is the server piece to accept new, incoming
// TCP packets.
const aggregate = require('./aggregate');
const programArgs = require('../../programArgs');
const parse = require('./parse');

const jsonContentType = 'application/json';
const binaryContentType = 'application/octet-stream';
const contentTypeKey = 'content-type';

function createServer(host, port, rootFn, responder, onServer) {
    const args = {
        port: port,
        host: host
    };
    
    console.log('creating server', host, port);
    const server = http.createServer(function _onResponse(req, res) {
        const headers = req.headers;
        const contentType = headers[contentTypeKey];
        const isJSON = contentType === jsonContentType;
        const bufs = [];
        
        req.
            on('data', function _data(chunk) {
                bufs.push(chunk);
            }).
            on('end', function _data() {
                const buffer = Buffer.concat(bufs);
                const incomingData = parse(buffer, isJSON, rootFn);
                const data = responder(incomingData, isJSON);

                res.setHeader(contentTypeKey, contentType);
                res.statusCode = 200;

                // JSON
                if (isJSON) {
                    res.write(JSON.stringify(data));
                }

                // FlatBuffers
                else {
                    res.write(new Buffer(data));
                }

                res.end();
            });
    });


    server.listen(args, function _serverStart(e) {
        console.log('server start', e);
        if (onServer) {
            onServer(e);
        }
    });
}

module.exports = createServer;
