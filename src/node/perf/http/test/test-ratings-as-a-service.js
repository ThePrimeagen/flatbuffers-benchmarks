'use strict';

const request = require('./request');
const runRatingsAsService = require('./run-ratings-as-a-service');
const programArgs = require('../../../programArgs');
const limiter = require('../limiter');
const Data = require('../../../data/index');
const RatingsRequest = Data.RatingsRequest;
const RatingsResponse = Data.RatingsResponse;
const rootFn = RatingsResponse.getRootAsRatingsResponse;
const flatbuffers = Data.flatbuffers;

const host = programArgs.host;
const port = programArgs.port;
const isJSON = programArgs.isJSON;

// My kids as client Ids :)
const Asher = 0;
const Caleb = 1;
const responseMap = {};

runRatingsAsService(function _onServer() {
    const opts = {
        host: host,
        port: port
    };
    const responder = limiter(4, respondToServer());
    executeRequest(opts, responder);
});

function executeRequest(opts, responder, incomingData) {
    const nextResponse = responder(incomingData);
    if (!nextResponse) {
        console.log('Caleb Initial Response', toString(responseMap[Caleb], isJSON));
        console.log('Caleb Second Response', toString(incomingData, isJSON));
        process.exit(0);
    }
    
    request(opts, nextResponse, isJSON, rootFn, function _completed(x, res) {
        executeRequest(opts, responder, res);
    });
}

// Taking shortcuts with ids.
const ids = [1, 2, 3, 4, 5];
function respondToServer() {
    let count = 0;
    return function respondToServer(data) {
        let request = null;
        if (count === 0) {
            console.log('Count 0');
            request = createRequest(Asher, isJSON);
        }
        
        else if (count === 1) {
            console.log('Count 1', data);
            responseMap[Asher] = data;
            request = createRequest(Caleb, isJSON);
        }

        else if (count === 2) {
            console.log('Count 2', data);
            responseMap[Caleb] = data;
            request = createRequest(Asher, isJSON);
        }

        else if (count === 3) {
            console.log('Count 3', data);
            const res = data;
            console.log('Asher Initial Response', toString(responseMap[Asher], isJSON));
            console.log('Asher Second Response', toString(res, isJSON));
            
            request = createRequest(Caleb, isJSON);
        }
        
        count++;
        
        return request;
    };
}

function createRequest(clientId, isJSON) {
    if (isJSON) {
        return {
            videos: ids,
            clientId: clientId
        };
    }
    
    const bb = new flatbuffers.Builder(5);
    const vOffset = RatingsRequest.createVideosVector(bb, ids);
    
    RatingsRequest.startRatingsRequest(bb);
    RatingsRequest.addVideos(bb, vOffset);
    RatingsRequest.addClientId(bb, clientId);

    const rOffset = RatingsRequest.endRatingsRequest(bb);
    RatingsRequest.finishRatingsRequestBuffer(bb, rOffset);
    
    return bb.asUint8Array();
}

function toString(response, isJSON) {
    if (isJSON) {
        return JSON.stringify(response.ratings);
    }
    
    const ratings = [];
    const len = response.ratingsLength();
    for (let i = 0; i < len; ++i) {
        ratings[i] = response.ratings(i);
    }
    
    return JSON.stringify(ratings);
}

