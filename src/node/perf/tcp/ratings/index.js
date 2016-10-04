'use strict';

const flatbuffers = require('../../../flatbuffers').flatbuffers;
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const RatingsResponse = require('../../../data/ratings-response_generated').Netflix.RatingsResponse;
const AsAService = require('../AsAService');
const random = require('../../../data/random').random;
const Cache = require('../Cache');
const programArgs = require('../../../programArgs');

const cache = new Cache();
const compress = programArgs.compress;

function responder(client, fullBuffer) {
    // slice off the length portionn.
    const buffer = fullBuffer.slice(4);
    AsAService.parse(buffer, RatingsRequest.getRootAsRatingsRequest, compress,
                     function _parsed(e, ratingsRequest) {
        const isJSON = AsAService.isJSONRequest(buffer);
        const clientId = isJSON ? ratingsRequest.clientId :
                             ratingsRequest.clientId();
        const data = fillRequest(ratingsRequest, clientId, isJSON);
        const requestLength = isJSON ? ratingsRequest.videos.length :
                             ratingsRequest.videosLength();

        AsAService.write(client, data, isJSON, compress);
    });
}

module.exports = responder;

function fillRequest(request, clientId, isJSON) {
    let videoMap = cache.get(clientId);
    if (!videoMap) {
        videoMap = {};
        cache.insert(clientId, undefined, videoMap);
    }


    const videosLength = isJSON ? request.videos.length : request.videosLength();
    const videoRatings = [];
    for (let i = 0; i < videosLength; ++i) {
        const videoId = isJSON ? request.videos[i] : request.videos(i);

        // Store the result into the video ratings array if we have cached
        // this video id.
        if (videoMap[videoId]) {
            videoRatings[i] = videoMap[videoId];
        }

        // generate a new rating and save it into the map
        else {
            const rating = random(50, 1);
            videoRatings[i] = videoMap[videoId] = rating;
        }
    }

    if (isJSON) {
        return {
            ratings: videoRatings,
            clientId: clientId
        };
    }

    const bb = new flatbuffers.Builder(videosLength);
    const vOffset = RatingsResponse.createRatingsVector(bb, videoRatings);

    RatingsResponse.startRatingsResponse(bb);
    RatingsResponse.addRatings(bb, vOffset);
    RatingsResponse.addClientId(bb, clientId);
    const offset = RatingsResponse.endRatingsResponse(bb);
    RatingsResponse.finishRatingsResponseBuffer(bb, offset);

    return bb.asUint8Array();
}

