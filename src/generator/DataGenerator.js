'use strict';

const startID = 8000000;
const ROW_TITLE_LEN = 10;
const VIDEO_TITLE_LEN = 10;
const VIDEO_SYNOPSIS_LEN = 160;

var DataGenerator = function DataGenerator() {
    this._cache = [];
    this._cursor = 0;
    this._id = 0;

    // creates at least one cached video.
    this._bodyOfText = '';
    let addStr = [];
    for (let i = 0; i < 5000; ++i) {
        addStr.push(_random(words));
    }
    this._bodyOfText = addStr.join(' ');
    this._createVideo();
};

DataGenerator.prototype = {

    createLolomo(r, c, percentSimilar) {
        const count = r * c;
        const id = this._getLolomoId();
        const rows = [];
        for (let i = 0; i < r; ++i) {
            rows.push(this._createRow(c, percentSimilar));
        }

        return {
            rows: rows,
            id: id
        };
    },

    getRandomString(len) {
        return this._read(len);
    },

    _getId() {
        return startID + ++this._id;
    },

    _getLolomoId(len) {
        len = len || 16;
        let str = '';
        for (let i = 0; i < len; ++i) {
            str += String.fromCharCode(40 + Math.floor(Math.random() * 52));
        }
        return str;
    },

    _getRowTitle() {
        return this._read(ROW_TITLE_LEN);
    },

    _getVideoTitle() {
        return this._read(VIDEO_TITLE_LEN);
    },

    _getVideoSynopsis() {
        return this._read(VIDEO_SYNOPSIS_LEN);
    },

    _read(len) {
        const length = this._bodyOfText.length;
        if (length < this._cursor + len) {
            this._cursor = 0;
        }
        const str = this._bodyOfText.substring(this._cursor, this._cursor + len)
        this._cursor += len;
        return str;
    },

    // An almost 10% chance of being original
    _getRandomOriginal() {
        return Math.random() > 0.10;
    },

    _getRandomCachedVideo() {
        return _random(this._cache);
    },

    _createVideo() {
        const video = {
            id: this._getId(),
            title: this._getVideoTitle(),
            synopsis: this._getVideoSynopsis(),
            altSynopsis: this._getVideoSynopsis(),
            original: this._getRandomOriginal(),
            count: 0
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
            videos: videos
        };
    }
};

const words = ["Some", "would", "argue", "that", "just", "restarting", "the", "application", "or", "throwing", "more", "RAM", "at", "it", "is", "all", "that", "is", "needed", "and", "memory", "leaks", "arent", "fatal", "in", "Node", "However", "as", "leaks", "grow", "V8", "becomes", "increasingly", "aggressive", "about", "garbage", "collection", "This", "is", "manifested", "as", "high", "frequency", "and", "longer", "time", "spent", "in", "GC", "slowing", "your", "app", "down", "So", "in", "Node", "memory", "leaks", "hurt", "performance", "Leaks", "can", "often", "be", "masked", "assasins", "Leaky", "code", "can", "hang", "on", "to", "references", "to", "limited", "resources", "You", "may", "run", "out", "of", "file", "descriptors", "or", "you", "may", "suddenly", "be", "unable", "to", "open", "new", "database", "connections", "So", "it", "may", "look", "like", "your", "backends", "are", "failing", "the", "application", "but", "it’s", "really", "a", "container", "issue"];
function _random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

module.exports = DataGenerator;
