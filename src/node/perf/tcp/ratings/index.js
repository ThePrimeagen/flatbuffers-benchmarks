'use strict';

const flatbuffers = require('../../../flatbuffers').flatbuffers;
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const RatingsResponse = require('../../../data/ratings-response_generated').Netflix.RatingsResponse;
const AsAService = require('../AsAService');
const random = require('../../../data/random').random;
const Cache = require('../Cache');
const programArgs = require('../../../programArgs');
const toBuffer = require('../../../toBuffer');

const cache = new Cache();
const compress = programArgs.compress;

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const objectMode = {objectMode: true};

const RatingsServiceStream = function _RatingsServiceStream() {
    Transform.call(this, objectMode);
};

module.exports = RatingsServiceStream;

inherits(RatingsServiceStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean
 * }} chunk - The chunked data from the framing stream
 */
RatingsServiceStream.prototype._transform = function _transform(chunk, enc, cb) {
    const isJSON = chunk.isJSON;
    const ratingsRequest = chunk.parsed;
    const clientId = isJSON ? ratingsRequest.clientId :
        ratingsRequest.clientId();

    const data = fillRequest(ratingsRequest, clientId, isJSON);

    this.push(AsAService.createTransportBuffer(toBuffer(data, isJSON), isJSON));

    cb();
};

RatingsServiceStream.prototype._flush = function _flush() {
    console.log('RatingsServiceStream#flush');
};

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

