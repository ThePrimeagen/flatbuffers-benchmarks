'use strict';

const toBuffer = require('typedarray-to-buffer');
const ROWS = process.argv[2];
const COLUMNS = process.argv[3];
const fbGenerator = require('../generator');
const DataGenerator = fbGenerator.DataGenerator;
const jsonGen = fbGenerator.json;
const fbGen = fbGenerator.fbs;
const NetflixFBS = fbGenerator.NetflixFBS;
const Lolomo = NetflixFBS.Lolomo;
const flatbuffers = fbGenerator.flatbuffers;
const fs = require('fs');
const gen = new DataGenerator();
let once = true;

[true, false].forEach(function _graphOrTree(isGraph) {
    const gOrTName = isGraph ? 'graph' : 'tree';

    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function _similarEach(simPercent) {
        
        // Reset always before generating data.
        gen.reset();
        
        const bName = ['b', gOrTName, ROWS, COLUMNS, simPercent].join('_');
        const jName = ['j', gOrTName, ROWS, COLUMNS, simPercent].join('_');
        const lolomo = gen.createLolomo(ROWS, COLUMNS, simPercent);
        const binData = toBuffer(fbGen(lolomo, isGraph));
        const jsonData = JSON.stringify(jsonGen(lolomo, isGraph));

        // Writes out the data.
        fs.writeFileSync('./results/' + bName + '.data', binData);
        fs.writeFileSync('./results/' + jName + '.data', jsonData);
    });
});
