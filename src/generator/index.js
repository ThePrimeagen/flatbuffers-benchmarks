module.exports = {
    DataGenerator: require('./DataGenerator'),
    LolomoGenerator: require('./LolomoGenerator'),
    json: require('./json'),
    fbs: require('./fbs'),
    flatbuffers: require('./../flatbuffers').flatbuffers,
    NetflixFBS: require('./lolomo_generated').Netflix
};
