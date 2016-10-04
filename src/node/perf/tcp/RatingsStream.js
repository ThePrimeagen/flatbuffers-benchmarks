'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const AsAService = require('./AsAService');
const RatingsRequest = require('../../data/ratings-request_generated').Netflix.RatingsRequest;
const RatingsResponse = require('../../data/ratings-response_generated').Netflix.RatingsResponse;
const TFramingStream = require('./TFramingStream');
const ParseStream = require('./ParseStream');
const programArgs = require('../../programArgs');

const objectMode = {objectMode: true};
const rootResponse = RatingsResponse.getRootAsRatingsResponse;
const compress = programArgs.compress;

const RatingsStream = function _RatingsStream(ratingClient) {
    Transform.call(this, objectMode);
    this._ratingClient = ratingClient;
    this._framer = new TFramingStream();

    const idMap = this._idMap = {};
    const self = this;

    ratingClient.
        pipe(this._framer).
        pipe(new ParseStream(rootResponse)).
        on('data', function _onRatingsData(data) {
            const isJSON = data.isJSON;
            const clientId = _getId(data.parsed, isJSON)
            const request = idMap[clientId];

            if (!request) {
                throw new Error(`request does not exist for RatingsStream for ${clientId}`);
            }

            // Update the lolomo.
            mergeData(request.lolomo, request.ids, data.parsed, isJSON);

            // Pushes the request object to the next client.
            self.push(request);
            idMap[clientId] = undefined;
        }).
        on('error', function _onRatingData(e) {
            console.log('ratingClient#ratingStream#error', e.message, e.stack);
        }).
        on('complete', function _onratingData() {
            console.log('ratingClient#ratingStream#complete');
        });
};

module.exports = RatingsStream;

inherits(RatingsStream, Transform);

/**
 * Expects chunk to be a message from the framer stream.
 *
 * @param {{
 *     original: Buffer,
 *     unparsed: Buffer,
 *     parsed: object,
 *     isJSON: boolean,
 *     clientId: null
 * }} chunk - The chunked data from the framing stream
 */
RatingsStream.prototype._transform = function _transform(chunk, enc, cb) {

    const isJSON = chunk.isJSON;
    const clientId = chunk.clientId;

    if (this._idMap[clientId]) {
        throw new Error(`This clientId ${clientId} is already in use`);
    }

    this._idMap[clientId] = chunk;

    const ids = chunk.ids = getIds(chunk.lolomo, isJSON, false);
    const ratingRequest = buildRatingsRequest(ids, clientId, isJSON);

    // write to the service
    AsAService.write(this._ratingClient, ratingRequest, isJSON, compress);
    cb();
};

RatingsStream.prototype._flush = function _flush() { };

RatingsStream.prototype.cleanUp = function cleanUp() {
    this._ratingsClient.unpipe(this._framer);
};

function _getId(parsed, isJSON) {
    return isJSON ? parsed.clientId : parsed.clientId();
}

function getIds(lolomo, isJSON, isGraph) {

    const videoMap = {};
    const rowLength = isJSON ? lolomo.rows.length : lolomo.rowsLength();
    for (let rIdx = 0; rIdx < rowLength; ++rIdx) {
        const row = isJSON ? lolomo.rows[rIdx] : lolomo.rows(rIdx);

        const videosLength = isJSON ? row.videos.length : row.videosLength();
        for (let vIdx = 0; vIdx < videosLength; ++vIdx) {
            const video = isJSON ? row.videos[vIdx] : row.videos(vIdx);
            const id = isJSON ? video.id : video.id();

            if (!videoMap[id]) {
                videoMap[id] = true;
            }
        }
    }

    return Object.keys(videoMap);
}

function buildRatingsRequest(ids, clientId, isJSON) {
    let request = null;
    if (isJSON) {
        return {
            videos: ids,
            clientId: clientId
        };
    }

    else {
        const bb = new flatbuffers.Builder(ids.length);
        const vOffset = RatingsRequest.createVideosVector(bb, ids);

        RatingsRequest.startRatingsRequest(bb);
        RatingsRequest.addVideos(bb, vOffset);
        RatingsRequest.addClientId(bb, clientId);

        const rOffset = RatingsRequest.endRatingsRequest(bb);
        RatingsRequest.finishRatingsRequestBuffer(bb, rOffset);

        return bb.asUint8Array();
    }
}

function mergeData(lolomo, ids, res, isJSON) {

    const videoMap = {};
    for (let idIdx = 0; idIdx < ids.length; ++idIdx) {
        const id = ids[idIdx];
        const rating = isJSON ? res.ratings[idIdx] : res.ratings(idIdx);

        videoMap[id] = rating;
    }

    const rowLength = isJSON ? lolomo.rows.length : lolomo.rowsLength();
    for (let rIdx = 0; rIdx < rowLength; ++rIdx) {
        const row = isJSON ? lolomo.rows[rIdx] : lolomo.rows(rIdx);

        const videosLength = isJSON ? row.videos.length : row.videosLength();
        for (let vIdx = 0; vIdx < videosLength; ++vIdx) {
            const video = isJSON ? row.videos[vIdx] : row.videos(vIdx);
            const id = isJSON ? video.id : video.id();

            if (isJSON) {
                video.starRating = videoMap[id];
            }
            else {
                video.mutate_starRating(videoMap[id]);
            }
        }
    }
}
