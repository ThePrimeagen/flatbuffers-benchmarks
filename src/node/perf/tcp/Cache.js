'use strict';

const Cache = function _Cache() {
    this._cache = {};
};

module.exports = Cache;

Cache.prototype.insert = function insert(k1, k2, data) {
    let cache = this._cache[k1];
    if (!cache) {
        if (k2) {
            cache = this._cache[k1] = {};
        }
        
        else {
            this._cache[k1] = data;
        }
    }
    
    if (k2) {
        cache[k2] = data;
        return;
    }

    
};

Cache.prototype.get = function get(k1, k2) {
    const clientCache = this._cache[k1];
    if (clientCache) {
        
        if (k2) {
            return clientCache[k2];
        }
        return clientCache;
    }
    
    return null;
};