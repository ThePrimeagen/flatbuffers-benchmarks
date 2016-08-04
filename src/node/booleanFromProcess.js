
module.exports = function booleanFromProcess(value, def) {
    console.log('Value', value, def);
    if (value === undefined) {
        return def;
    }

    if (typeof value === 'string') {
        return value === 'true';
    }

    return value;
};
