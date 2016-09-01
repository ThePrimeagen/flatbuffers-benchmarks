'use strict';

module.exports = function aggregate(bufs, totalLength) {
    const buffer = Buffer.allocUnsafe(totalLength);
    let start = 0, i = 0;
    while (start < totalLength) {
        const b = bufs[i];
        const stop = start + b.length;

        b.copy(buffer, start);
        ++i;
        start += stop;
    }
    
    return buffer;
};
