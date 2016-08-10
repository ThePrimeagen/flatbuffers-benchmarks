module.exports = {
    DataGenerator: require('./DataGenerator'),
    LolomoGenerator: require('./LolomoGenerator'),
    json: require('./json'),
    jsonStringify: require('./lolomo.json-schema'),
    fbs: require('./fbs'),
    flatbuffers: require('./../flatbuffers').flatbuffers,
    NetflixFBS: require('./lolomo_generated').Netflix,
    LolomoRequest: require('./lolomo-request_generated').Netflix.LolomoRequest
};
