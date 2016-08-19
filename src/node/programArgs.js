const minimist = require('minimist');
const args = minimist(process.argv.slice(2));

const defaultArgs = Object.
    keys(args).
    reduce(function _assign(defaults, k) {
        if (args[k] === 'true') {
            args[k] = true;
        }

        else if (args[k] === 'false') {
            args[k] = false;
        }

        defaults[k] = args[k];

        return defaults;
    }, {
        rows: 40,
        columns: 75,
        percentSimilar: 0.1,
        isJSON: true,
        opsCount: 100,
        host: 'localhost',
        port: 33333,
        mutationCount: 10,
        clientId: 1,
        report: false,
        isGraph: false,
    
        // Purely for the aggregation service runner.
        lolomoHost: 'localhost',
        lolomoPort: 33334,
        ratingsHost: 'localhost',
        ratingsPort: 33335
    });

module.exports = defaultArgs;
