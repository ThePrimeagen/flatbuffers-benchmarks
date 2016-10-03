'use strict';

const http = require('http');

const jsonContentType = 'application/json';
const binaryContentType = 'application/octet-stream';
const parse = require('../parse');

function request(opts, data, isJSON, rootFn, cb) {
    if (!opts.method) {
        opts.method = 'POST';
    }

    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = isJSON ? jsonContentType : binaryContentType;

    const req = http.request(opts, function _onData(res) {
        const bufs = [];
        res.on('data', function _data(chunk) {
            bufs.push(chunk);
        });

        res.on('end', function _complete() {
            const buffer = Buffer.concat(bufs);
            const data = parse(buffer, isJSON, rootFn);

            cb(null, data);
        });

        res.on('error', function _err(e) {
            cb(e);
        });
    });
    req.write(isJSON ? JSON.stringify(data) : new Buffer(data));
    req.end();
}

module.exports = request;
