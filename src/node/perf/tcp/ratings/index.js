'use strict';

const flatbuffers = require('../../../flatbuffers').flatbuffers;
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const AsAService = require('../AsAService');
const random = require('../../../data/random');
const videoRatingCache = {};
const Cache = require('../Cache');
const cache = new Cache();

function responder(client, buffer) {
    const isJSON = AsAService.isJSONRequest(buffer);
    const ratingsRequest = AsAService.parse(buffer, RatingsRequest.getRootAsLolomo);
    const clientId = isJSON ? lolomoRequest.clientId : lolomoRequest.clientId();
    let data = cache.get(clientId, );

    if (!data) {
        data = fillRequest(ratingsRequest)
        cache.insert(clientId, data, isJSON);
    }

    const outBuf = toBuffer(data, isJSON);
    client.write(AsAService.createTransportBuffer(outBuf, isJSON));
}

module.exports = responder;

function toBuffer(lolomo, isJSON) {
    if (isJSON) {
        return new Buffer(JSON.stringify(lolomo));
    }

    return new Buffer(lolomo);
}

function fillRequest(request, clientId, isJSON) {
    let videoMap = cache.get(clientId);
    if (!videoMap) {
        videoMap = {};
        cache.insert(clientId, undefined, videoMap);
    }
    
    // Create request.
}

