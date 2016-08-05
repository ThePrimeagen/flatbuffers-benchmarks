const fastJSON = require('fast-json-stringify');

const BadgingSchema = {
    type: 'object',
    properties: {
        HD: {type: 'boolean'},
        UHD: {type: 'boolean'},
        Dolby5_1: {type: 'boolean'},
        Dolby7_1: {type: 'boolean'},
        HDR: {type: 'boolean'}
    }
};

const VideoSchema = {
    type: 'object',
    properties: {
        id: {type: 'string'},
        title: {type: 'string'},
        synopsis: {type: 'string'},
        altSynopsis: {type: 'string'},
        isOriginal: {type: 'boolean'},
        isSeason: {type: 'boolean'},
        isMovie: {type: 'boolean'},
        runningTime: {type: 'integer'},
        maturityRating: {type: 'string'},
        starRating: {type: 'integer'},
        yearCreated: {type: 'integer'},
        badging: BadgingSchema
    }
};

const RowSchema = {
    type: 'object',
    properties: {
        title: {type: 'string'},
        id: {type: 'string'},
        videos: {
            type: 'array',
            items: VideoSchema
        }
    }
};

const LolomoSchema = {
    type: 'object',
    properties: {
        rows: {
            type: 'array',
            items: RowSchema
        },
        id: {type: 'string'}
    }
};

module.exports = fastJSON(LolomoSchema);
