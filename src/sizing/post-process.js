'use strict';

const fs = require('fs');
const path = require('path');

// Yeah I am going to use Sync Interfaces because I don't care about perf :)
const graphAndTrees = fs.
    readdirSync(results()).
    filter(function _filterDot(f) {
        return f !== '.' && f !== '..';
    }).

    // parses out the required information from the file name and
    // constructs the fully qualified path.
    map(function _constructData(f) {
        const splitData = f.split('_');
        const format = splitData[0] === 'j' ? 'JSON' : 'FlatBuffers';
        const type = splitData[1];
        const rows = Number(splitData[2]);
        const cols = Number(splitData[3]);
        const percentSim = Number(splitData[4].slice(0, splitData[4].indexOf('.data')));
        const fullPath = results(f);
        const size = fs.statSync(fullPath).size;
        const isGZip = f.indexOf('gz') >= 0;

        return {
            path: fullPath,
            size: size,
            format: format,
            type: type,
            rows: rows,
            percentSimilar: percentSim,
            isGZip: isGZip,
            columns: cols
        };
    }).

    reduce(function _group(acc, data) {
        const listArea = data.isGZip ? acc.gz : acc;

        let dataFormat = listArea[data.format];
        if (!dataFormat) {
            dataFormat = listArea[data.format] = {};
        }

        let dataType = dataFormat[data.type];
        if (!dataType) {
            dataType = dataFormat[data.type] = {};
        }

        let list = dataType[data.percentSimilar];
        if (!list) {
            dataType[data.percentSimilar] = list = [];
        }

        list.push(data);

        return acc;
    }, {gz: {}});

// This is purely for viewing purposes.
recurseForListsAndSort(graphAndTrees);
recurseAndSaveCSV(graphAndTrees, '');

[0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function _readFiles(f) {

});

function recurseAndSaveCSV(item, typeName) {
    Object.
        keys(item).
        forEach(function _keys(k) {
            if (k === 'tree' || k === 'graph') {
                console.log('saving csv with', typeName);
                saveCSV(item[k], typeName + '.' + k);
            }

            else {
                let nextName = typeName + '.' + k;
                if (nextName.indexOf('.') === 0) {
                    nextName = nextName.substring(1);
                }

                console.log('Recursing with', nextName);
                recurseAndSaveCSV(item[k], nextName);
            }
        });
}

// Take the graph and the tree and produce the CSV for them.  First the data
// must be sorted into its proper columns.
function recurseForListsAndSort(item) {
    if (Array.isArray(item)) {
        item.sort(sortResults);
        return;
    }

    Object.
        keys(item).
        forEach(function _keys(k) {
            recurseForListsAndSort(item[k]);
        });
}

function saveCSV(set, type) {

    Object.
        keys(set).
        forEach(function _percision(k) {
            let csv = [['rows', 'cols', 'sim', 'size']];
            const listData = set[k].map(function _data(data) {
                return [
                    data.rows,
                    data.columns,
                    data.percentSimilar,
                    data.size
                ];
            });
            csv = csv.concat(listData);

            const fileContents = csv.join('\n');
            const format = set[k][0].format;
            const fileName = results(type + '_' + k + '.csv');
            fs.writeFileSync(fileName, fileContents);
        });
}

function sortResults(a, b) {

    // By format
    if (a.format === b.format) {

        // By rows
        if (a.rows === b.rows) {
            if (a.columns === b.columns) {
                if (a.percentSimilar < b.percentSimilar) {
                    return -1;
                }
                return 1;
            }
            else if (a.columns < b.columns) {
                return -1;
            }

            else {
                return 1;
            }
        }

        else if (a.rows < b.rows) {
            return -1;
        }

        else {
            return 1;
        }
    }

    // Binary before json
    else if (a.format === 'b') {
        return -1;
    }

    else {
        return 1;
    }
}


function results(f) {
    if (!f) {
        return path.join(__dirname, 'results');
    }

    return path.join(__dirname, 'results', f);
}
