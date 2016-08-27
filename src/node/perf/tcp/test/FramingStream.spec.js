'use strict';

const FramingStream = require('../FramingStream');
const Duplex = require('stream').Duplex;
const inherits = require('util').inherits;
const AsAService = require('../AsAService');
const assert = require('assert');

function TestPlex() {
    Duplex.call(this);
}

inherits(TestPlex, Duplex);

TestPlex.prototype.case1_case2 = function _case1() {
    const dat = new Buffer('OneTwoThree');
    const buffer = AsAService.createTransportBuffer(dat, true);

    const p1 = buffer.slice(0, 4);
    const p2 = buffer.slice(4);

    let count = 0;

    const self = this;
    console.log('starting');
    const id = setInterval(function() {
        if (count === 0) {
            self.push(p1);
        }
        if (count === 1) {
            self.push(p2);
            clearInterval(id);
            test([buffer.slice(4)]);
        }
        count++;
    }, 100);
};

TestPlex.prototype.case3_case3 = function _case1() {
    const dat = new Buffer('OneTwoThree');
    const dat2 = new Buffer('Four');
    const buffer = AsAService.createTransportBuffer(dat, true);
    const b2 = AsAService.createTransportBuffer(dat2, true);
    const b3 = Buffer.concat([buffer, b2]);
    
    console.log('case3_case3');
    this.push(b3);
    test([buffer.slice(4), b2.slice(4)]);
};

TestPlex.prototype.case2 = function _case1() {
    const dat = new Buffer('OneTwoThree');
    const buffer = AsAService.createTransportBuffer(dat, true);

    console.log('case2');
    this.push(buffer);
    test([buffer.slice(4)]);
};

TestPlex.prototype.case1_case3 = function _begin() {
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
            test([buffer.slice(4), b2.slice(4)]);
        }
        count++;
    }, 100);
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
let testing = [];

framing.write(new Buffer('hello'));

parent.
    pipe(framing).
    on('data', function(chunk) {
        console.log('data', chunk.toString());
        testing.push(chunk);
    }).
    on('error', function(e) {
        console.log('error', e);
    });

// TODO: I know this is horribly dirty, but you got to do what you got to do.
function test(exp) {
    console.log('test', exp, testing);
    exp.forEach(function _assert(item, i) {
        assert(Buffer.compare(testing[i], item) === 0, ['expected', item, ' === ', testing[i]]);
    });
    testing = [];
    runner();
}
const tests = [parent.case1_case2, parent.case1_case3, parent.case3_case3, parent.case2];
const runner = (function() {
    let i = 0;
    return function() {
        console.log('testing', i);
        if (i < tests.length) {
            const test = tests[i];
            ++i;
            test.call(parent);
        }
    };
})();

