module.exports = {
    DataGenerator: require('./DataGenerator'),
    json: require('./json'),
    fbs: require('./fbs'),
    flatbuffers: require('./../flatbuffers').flatbuffers,
    NetflixFBS: require('./test_generated').Netflix
};
