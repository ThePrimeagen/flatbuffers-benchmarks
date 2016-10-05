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
        host: process.env.SERVER_ADDR || 'localhost',
        port: 33333,
        mutationCount: 10,
        clientId: 1,
        report: false,
        isGraph: false,

        // Purely for the aggregation service runner.
        lolomoHost: process.env.LOLOMO_ADDR || 'localhost',
        lolomoPort: 33334,
        ratingsHost: process.env.RATINGS_ADDR || 'localhost',
        ratingsPort: 33335,

        // If compression should happen
        compress: false,

        // for spam client defaults
        // This will use rows, columns, host, port, and clientId
        // to construct the URL to hit for spam clients.
        curlTimes: 1000,

        // For debugging purposes only.
        debug: false
    });

module.exports = defaultArgs;
