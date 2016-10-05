'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

const AsAService = require('./AsAService');
const RatingsRequest = require('../../data/ratings-request_generated').Netflix.RatingsRequest;
const RatingsResponse = require('../../data/ratings-response_generated').Netflix.RatingsResponse;
const TFramingStream = require('./TFramingStream');
const ParseStream = require('./ParseStream');
const programArgs = require('../../programArgs');
const flatbuffers = require('../../flatbuffers').flatbuffers;

const objectMode = {objectMode: true};
const compress = programArgs.compress;

const RatingsStream = function _RatingsStream(ratingClient) {
    Transform.call(this, objectMode);
    this._ratingClient = ratingClient;
};

module.exports = RatingsStream;

inherits(RatingsStream, Transform);

/**
 * On data.  This is the response from the underlying tcp connection to the
 * ratings client.
 */
RatingsStream.prototype.onData = function _onData(memo, data) {
    const isJSON = memo.isJSON;
    const clientId = _getId(memo.parsed, isJSON)

    // Update the lolomo.
    mergeData(memo.lolomo, memo.ids, data.parsed, isJSON);

    // Pushes the memo object to the next client.
    this.push(memo);
};

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
    const ids = chunk.ids = getIds(chunk.lolomo, isJSON, false);
    const ratingRequest = buildRatingsRequest(ids, clientId, isJSON);

    // write to the service and wait for the callback onData
    const buf = AsAService.toTCPBuffer(ratingRequest, isJSON);
    this._ratingClient.write(buf, chunk, this);
    cb();
};

RatingsStream.prototype._flush = function _flush() { };

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
