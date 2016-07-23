'use strict';

// Reports JSON string lengths.
for (let count = 1; count <= 1001; count += 100) {
    const things = [];
    for (let i = 0; i < 9; ++i) {
        const number = 1 * Math.pow(10, i);

        for (let j = 0; j < count; ++j) {
            things[j] = {
                d: number
            };
        }

        console.log('length(', count, number, ')', JSON.stringify(things).length);
    }
}
