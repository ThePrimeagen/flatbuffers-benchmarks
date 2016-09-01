'use strict';

const client = require('./client');
const runRatingsAsService = require('./run-ratings-as-a-service');
const AsAService = require('../../tcp/AsAService');
const programArgs = require('../../../programArgs');
const limiter = require('../limiter');
const Data = require('../../../data/index');
const RatingsRequest = Data.RatingsRequest;
const RatingsResponse = Data.RatingsResponse;
const flatbuffers = Data.flatbuffers;

const host = programArgs.host;
const port = programArgs.port;
const isJSON = programArgs.isJSON;

// My kids as client Ids :)
const Asher = 0;
const Caleb = 1;
const responseMap = {};

runRatingsAsService(function _onServer() {
    const responder = limiter(4, respondToServer());

    client(host, port, responder, null, function _completed(x, chunk) {
        const res = AsAService.parse(chunk, RatingsResponse.getRootAsRatingsResponse);
        console.log('Caleb Initial Response', toString(responseMap[Caleb], isJSON));
        console.log('Caleb Second Response', toString(res, isJSON));
        
        process.exit(0);
    });
});

// Taking shortcuts with ids.
const ids = [1, 2, 3, 4, 5];
function respondToServer() {
    let count = 0;
    return function respondToServer(writer, chunk) {
        let request = null;
        if (count === 0) {
            console.log('Count 0');
            request = createRequest(Asher, isJSON);
        }
        
        else if (count === 1) {
            console.log('Count 1');
            responseMap[Asher] = AsAService.parse(chunk, RatingsResponse.getRootAsRatingsResponse);
            request = createRequest(Caleb, isJSON);
        }

        else if (count === 2) {
            console.log('Count 2');
            responseMap[Caleb] = AsAService.parse(chunk, RatingsResponse.getRootAsRatingsResponse);
            request = createRequest(Asher, isJSON);
        }

        else if (count === 3) {
            console.log('Count 3');
            const res = AsAService.parse(chunk, RatingsResponse.getRootAsRatingsResponse);
            console.log('Asher Initial Response', toString(responseMap[Asher], isJSON));
            console.log('Asher Second Response', toString(res, isJSON));
            
            request = createRequest(Caleb, isJSON);
        }
        
        count++;
        
        if (request) {
            writer.write(AsAService.createTransportBuffer(toBuffer(request), isJSON));
        }
    };
}

function createRequest(clientId, isJSON) {
    if (isJSON) {
        return JSON.stringify({
            videos: ids,
            clientId: clientId
        });
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

function toBuffer(request, isJSON) {
    let arg = request;
    if (isJSON) {
        arg = JSON.stringify(request);
    }
    return new Buffer(arg);
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

