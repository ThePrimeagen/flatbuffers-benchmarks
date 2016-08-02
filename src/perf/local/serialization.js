const Generator = require('./../../generator');
const LolomoGenerator = Generator.LolomoGenerator;
const flatbuffers = Generator.flatbuffers;
const Netflix = Generator.NetflixFBS;
const Benchmark = require('benchmark');
const Suite = Benchmark.Suite;
const suite = new Suite();
const lolomoGen = new LolomoGenerator();
const Lolomo = Netflix.Lolomo;

const columns = 75;
const percentSimilar = 0.10;
[true, false].forEach(function produceTests(makeGraph) {
    [1, 10, 20, 30, 40, 100].forEach(function rows(r) {
        const fbs = lolomoGen.getLolomoAsFBS(r, columns, percentSimilar, false);
        const json = lolomoGen.getLolomoAsJSON(r, columns, percentSimilar, false);
        const values = ['Rows(', r, ') Columns(', columns,
                        ') sim(', percentSimilar, '): ', makeGraph];

        const fbsTestName = ['FBS - '].concat(values);
        const jsonTestName = ['JSON - '].concat(values);

        suite.
            add(fbsTestName.join(''), function _fbsTest() {
                const bb = new flatbuffers.ByteBuffer(fbs);
                return Lolomo.getRootAsLolomo(bb).bb.bytes();
            }).
            add(jsonTestName.join(''), function _jsonTest() {
                return JSON.parse(JSON.stringify(json));
            });
    });
});

suite.
    on('cycle', function(e) {
        console.log(e.target.name, e.target.hz);
    }).
    on('error', function(e) {
        console.log(e);
    }).
    run();
