'use strict';

const assert = require('assert');

const DataGenerator = require('./DataGenerator');
const randomListItem = require('./random').randomListItem;
const fbs = require('./fbs');
const json = require('./json');

const startID = 8000000;
const ROW_TITLE_LEN = 10;
const VIDEO_TITLE_LEN = 10;
const VIDEO_SYNOPSIS_LEN = 160;
const maturityList = [
    "Y",
    "PG",
    "PG_13",
    "TV_14",
    "TV_17",
    "R",
    "NR"
];

let ID = 8000000;

const LolomoGenerator = function LolomoGenerator() {
    this._cache = [];
    this._generator = new DataGenerator();
    this._createVideo();
};

module.exports = LolomoGenerator;

LolomoGenerator.prototype = {
    createLolomo(r, c, percentSimilar) {
        percentSimilar = percentSimilar || 0;

        const count = r * c;
        const id = this._generateId();
        const rows = [];
        for (let i = 0; i < r; ++i) {
            rows.push(this._createRow(c, percentSimilar));
        }

        return {
            rows: rows,
            id: id
        };
    },

    getLolomoAsFBS(r, c, percentSimilar, unique) {
        const lolomo = this.createLolomo(r, c, percentSimilar);
        return fbs(lolomo, unique);
    },

    getLolomoAsJSON(r, c, percentSimilar, unique) {
        const lolomo = this.createLolomo(r, c, percentSimilar);
        return json(lolomo, unique);
    },

    reset() {
        this._cache = [];
        this._generator.reset();
        this._createVideo();
    },

    _getId() {
        return ++ID;
    },

    _generateId(len) {
        len = len || 16;
        let str = '';
        for (let i = 0; i < len; ++i) {
            str += String.fromCharCode(40 + Math.floor(Math.random() * 52));
        }
        return str;
    },

    _getRowTitle() {
        return this._generator.getRandomString(ROW_TITLE_LEN);
    },

    _getVideoTitle() {
        return this._generator.getRandomString(VIDEO_TITLE_LEN);
    },

    _getVideoSynopsis() {
        return this._generator.getRandomString(VIDEO_SYNOPSIS_LEN);
    },

    _getRandomBoolean(chance) {
        return Math.random() > chance;
    },

    _getRandomCachedVideo() {
        return randomListItem(this._cache);
    },

    _createVideo() {
        const video = {
            id: this._getId(),
            title: this._getVideoTitle(),
            synopsis: this._getVideoSynopsis(),
            altSynopsis: this._getVideoSynopsis(),
            isOriginal: this._getRandomBoolean(.1),
            isSeason: this._getRandomBoolean(.7),
            isMovie: this._getRandomBoolean(.3),
            runningTime: 1, 
            maturityRating: randomListItem(maturityList),
            starRating: this._generator.getRandomInt(50, 1),
            yearCreated: this._generator.getRandomInt(2016, 1896),
            badging: {
                HD: this._getRandomBoolean(.9),
                UHD: this._getRandomBoolean(.2),
                Dolby5_1: this._getRandomBoolean(.9),
                Dolby7_1: this._getRandomBoolean(.3),
                HDR: this._getRandomBoolean(.01)
            }
        };

        // caches the video right away.
        this._cache.push(video);

        return video;
    },

    _createRow(columns, percentSimilar) {
        const similarCount = Math.floor(percentSimilar * columns);
        const startOfSimilars = columns - similarCount;
        const title = this._getRowTitle();
        const videos = [];

        for (let i = 0; i < columns; ++i) {
            if (i >= startOfSimilars) {
                videos.push(this._getRandomCachedVideo());
            } else {
                videos.push(this._createVideo());
            }
        }

        return {
            title: title,
            id: this._generateId(),
            videos: videos
        };
    }
};

LolomoGenerator.validate = function _validate(lolomo, fbsLolomo) {
    assert(lolomo.id === fbsLolomo.id());
    assert(lolomo.rows.length === fbsLolomo.rowsLength());
};
