'use strict';

const FramingStream = require('../FramingStream');
const Duplex = require('stream').Duplex;
const inherits = require('util').inherits;
const AsAService = require('../AsAService');

function TestPlex() {
    Duplex.call(this);
}

inherits(TestPlex, Duplex);

TestPlex.prototype.case3 = function _begin() {
    const dat = new Buffer('OneTwoThree');
    const dat2 = new Buffer('Four');
    const buffer = AsAService.createTransportBuffer(dat, true);
    const b2 = AsAService.createTransportBuffer(dat2, true);
    
    const p1 = buffer.slice(0, 4);
    const p2 = buffer.slice(4, 7);
    const p3 = Buffer.concat([buffer.slice(7), b2.slice(0, 1)]);
    const p4 = b2.slice(1);
    
    let count = 0;
    
    const self = this;
    const id = setInterval(function() {
        if (count === 0) {
            self.push(p1);
        }
        if (count === 1) {
            self.push(p2);
        }
        if (count === 2) {
            self.push(p3);
        }
        if (count === 3) {
            console.log('pushing 3', p4.length, p4.toString());
            self.push(p4);
            clearInterval(id);
        }
        count++;
    }, 500);
};

TestPlex.prototype._read = function () {
    console.log('read');
};
TestPlex.prototype._write = function (a, b, cb) {
    console.log('write');
    cb();
};

const parent = new TestPlex();
const framing = new FramingStream();

parent.
    pipe(framing).
    on('data', function(chunk) {
        console.log('DATA', chunk.toString());
    }).
    on('error', function(e) {
        console.log('error', e);
    });

parent.case3();
