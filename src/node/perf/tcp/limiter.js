'use strict';

module.exports = function limiter(maxCount, fn) {
    let count = 0;
    return function _limiter() {

        console.log('count', count, maxCount, count < maxCount);
        if (count < maxCount) {
            count++;

            fn.apply(null, arguments);
            return true;
        }

        console.log('false');
        return false;
    };
};
