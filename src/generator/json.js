'use strict';

// TODO: implement unique
function generate(lolomo, unique) {
    return lolomo;
};

module.exports = generate;

generate.print = function printTestLolomo(lolomo) {
    console.log('JSON', JSON.stringify(lolomo, function __filter(k, v) {
        if (k === 'synopsis' || k === 'altSynopsis') {
            return;
        }
        return v;
    }, 4));
}
