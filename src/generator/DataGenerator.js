'use strict';

const randomListItem = require('./random').randomListItem;

var DataGenerator = function DataGenerator() {
    this._cache = [];
    this._cursor = 0;
    this._id = 0;

    // creates at least one cached video.
    this._bodyOfText = '';
    let addStr = [];
    for (let i = 0; i < 5000; ++i) {
        addStr.push(randomListItem(words));
    }
    this._bodyOfText = addStr.join(' ');
};

DataGenerator.prototype = {

    getRandomString(len) {
        return this._generate(len);
    },

    getRandomInt(upperBound, lowerBound) {
        upperBound = upperBound || 1;
        lowerBound = lowerBound || 0;
        return lowerBound + Math.floor(Math.random() * (upperBound - lowerBound));
    },

    // Resets the data generator to be able to reproduce rows correctly.
    reset() {
        this._cursor = 0;
        this._id = 0;
    },

    _generate(len) {
        const length = this._bodyOfText.length;
        if (length < this._cursor + len) {
            this._cursor = 0;
        }
        const str = this._bodyOfText.substring(this._cursor, this._cursor + len)
        this._cursor += len;
        return str;
    },

};

const words = ["Some", "would", "argue", "that", "just", "restarting", "the", "application", "or", "throwing", "more", "RAM", "at", "it", "is", "all", "that", "is", "needed", "and", "memory", "leaks", "arent", "fatal", "in", "Node", "However", "as", "leaks", "grow", "V8", "becomes", "increasingly", "aggressive", "about", "garbage", "collection", "This", "is", "manifested", "as", "high", "frequency", "and", "longer", "time", "spent", "in", "GC", "slowing", "your", "app", "down", "So", "in", "Node", "memory", "leaks", "hurt", "performance", "Leaks", "can", "often", "be", "masked", "assasins", "Leaky", "code", "can", "hang", "on", "to", "references", "to", "limited", "resources", "You", "may", "run", "out", "of", "file", "descriptors", "or", "you", "may", "suddenly", "be", "unable", "to", "open", "new", "database", "connections", "So", "it", "may", "look", "like", "your", "backends", "are", "failing", "the", "application", "but", "it’s", "really", "a", "container", "issue"];

module.exports = DataGenerator;
