'use strict';

const programArgs = require('../../../programArgs');
const server = require('../server');
const request = require('./request');
const Netflix = require('../../../data/lolomo_generated').Netflix;
const RatingsRequest = require('../../../data/ratings-request_generated').Netflix.RatingsRequest;
const RatingsResponse = require('../../../data/ratings-response_generated').Netflix.RatingsResponse;
const LolomoGenerator = require('../../../data/LolomoGenerator');
const flatbuffers = require('../../../flatbuffers').flatbuffers;

const Lolomo = Netflix.Lolomo;
const lolomoRoot = Lolomo.getRootAsLolomo;
const ratingRoot = RatingsResponse.getRootAsRatingsResponse; 

function runWhenReady() {
    const lHost = programArgs.lolomoHost;
    const lPort = programArgs.lolomoPort;
    const rHost = programArgs.ratingsHost;
    const rPort = programArgs.ratingsPort;
    const host = programArgs.host;
    const port = programArgs.port;
    const lolomoArgs = {host: lHost, port: lPort};
    const ratingsArgs = {host: rHost, port: rPort};

    let fbsCount = 0;
    let jsonCount = 0;
    let fbsVideoCount = 0;
    let jsonVideoCount = 0;
    
    const intervalId = setInterval(function _reportRPS() {
        console.log('port', programArgs.port);
        console.log('RPS(fbs): ', fbsCount / 10);
        console.log('RPS(json): ', jsonCount / 10);
        console.log('RPS(videos.fbs): ', fbsVideoCount / 10);
        console.log('RPS(videos.json): ', jsonVideoCount / 10);
        
        fbsCount = jsonCount = fbsVideoCount = jsonVideoCount = 0;
    }, 10000);

    server.createResponseServer(host, port, function _getLolomo(url, isJSON, res) {
        let clientId = 0;
        let rows = 0;
        let columns = 0;

        const query = url.split('?')[1];
        if (query) {
            query.
                split('&').
                forEach(function _eachParam(param) {
                    const kValue = param.split('=');
                    const key = kValue[0];
                    const value = Number(kValue[1]);
                    switch (key) {
                        case 'rows':
                            rows = value;
                            break;
                        case 'columns':
                            columns = value;
                            break;
                        case 'clientId':
                            clientId = value;
                            break;
                        default: break;
                    }
                });
        }
        
        if (clientId === 0) {
            throw new Error(['ClientID = 0', clientId, rows, columns, url].join(' '));
        }
        
        const lolomoRequest = LolomoGenerator.createRequest(
            clientId, rows, columns, 0, false, isJSON);
        
        request(lolomoArgs, lolomoRequest, isJSON, lolomoRoot, function _onLolomo(e, lolomo) {
            if (e) {
                throw new Error(e);
            }

            const ids = getIds(lolomo, isJSON, false);
            const ratingRequest = buildRatingsRequest(ids, clientId, isJSON);
            
            request(ratingsArgs, ratingRequest, isJSON, ratingRoot, function _onRating(e, ratingsResponse) {
                mergeData(lolomo, ids, ratingsResponse, isJSON);
                res.write(isJSON ? JSON.stringify(lolomo) : new Buffer(lolomo.bb.bytes()));
                res.end();
                
                if (isJSON) {
                    jsonCount++;
                    jsonVideoCount += rows * columns;
                }
                
                else {
                    fbsCount++;
                    fbsVideoCount += rows * columns;
                }
            });
        });
    });

}

function getClientId(obj, isJSON) {
    return isJSON ? obj.clientId : obj.clientId();
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
        request = {
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

        request = bb.asUint8Array();
    }
    return request;
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

if (require.main === module) {
    runWhenReady();
}