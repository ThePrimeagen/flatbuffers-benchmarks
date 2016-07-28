'use strict';

const assert = require('assert');

const flatbuffers = require('./../flatbuffers').flatbuffers;
const NetflixFBS = require('./test_generated').Netflix;

function generate(lolomo, unique) {
    // Convert to fbs.
    const fbb = new flatbuffers.Builder(1);
    const rowIndices = [];
    const videosMap = {};
    const rows = lolomo.rows;

    for (let i = 0; i < rows.length; ++i) {
        const row = rows[i];
        const videos = row.videos;
        const vIndices = fillVideos(fbb, videos, unique, videosMap);
        createRow(fbb, row, vIndices, rowIndices);
    }

    createLolomo(fbb, lolomo, rowIndices);

    return fbb.asUint8Array();
};

module.exports = generate;

generate.print = function printTestLolomo(testLolomo) {
    console.log('BINARY', testLolomo.id());
    console.log(testLolomo.rowsLength());
    const rowsLen = testLolomo.rowsLength();
    for (let rowIdx = 0; rowIdx < rowsLen; ++rowIdx) {
        let row = testLolomo.rows(rowIdx);
        let videosLen = row.videosLength();

        console.log('    ', row.title());
        console.log('    ', 'videos: [');
        for (let videoIdx = 0; videoIdx < videosLen; ++videoIdx) {
            let video = row.videos(videoIdx);
            console.log('   ', '   ', '{');
            console.log('   ', '   ', '   ', video.title());
            console.log('   ', '   ', '   ', video.id());
            console.log('   ', '   ', '   ', video.original());
            console.log('   ', '   ', '}');
        }
        console.log('    ', ']');
    }
}

generate.compare = function compareJSONToFB(lolomo, testLolomo) {
    assert(lolomo.id === testLolomo.id());
    assert(lolomo.rows.length === testLolomo.rowsLength());
    const rowsLen = testLolomo.rowsLength();
    for (let rowIdx = 0; rowIdx < rowsLen; ++rowIdx) {
        let row = testLolomo.rows(rowIdx);
        let jsonRow = lolomo.rows[rowIdx];
        let videosLen = row.videosLength();
        let jsonVideosLen = jsonRow.videos.length;

        assert(videosLen === jsonVideosLen);
        assert(row.title() === jsonRow.title);
        for (let videoIdx = 0; videoIdx < videosLen; ++videoIdx) {
            let video = row.videos(videoIdx);
            let jsonVideo = jsonRow.videos[videoIdx];

            assert(video.title() === jsonVideo.title);
            assert(video.synopsis() === jsonVideo.synopsis);
            assert(video.altSynopsis() === jsonVideo.altSynopsis);
            assert(video.original() === jsonVideo.original, ['video.original(', video.original(), ') == ', jsonVideo.original]);
            assert(video.id() === jsonVideo.id);
        }
    }
}

function fillVideos(builder, videos, unique, videosMap) {
    const videoIndices = [];
    for (let i = 0; i < videos.length; ++i) {
        const video = videos[i];

        if (unique && videosMap[video.id]) {
            const vidIndex = videosMap[video.id];
            videoIndices.push(vidIndex);
            continue;
        }

        videosMap[video.id] = createVideo(builder, video, videoIndices);
    }

    return videoIndices;
}

const Lolomo = NetflixFBS.Lolomo;
function createLolomo(builder, lolomo, listOfRowIndices) {

    const idOffset = builder.createString(lolomo.id);
    const rowsIndex = Lolomo.createRowsVector(builder, listOfRowIndices);

    Lolomo.startLolomo(builder);
    Lolomo.addId(builder, idOffset);
    Lolomo.addRows(builder, rowsIndex);

    const lolomoIndex = Lolomo.endLolomo(builder);
    Lolomo.finishLolomoBuffer(builder, lolomoIndex);
}

const Row = NetflixFBS.Row;
function createRow(builder, row, listOfVideoIndices, listOfRowIndices) {

    const titleOffset = builder.createString(row.title);
    const videosIndex = Row.createVideosVector(builder, listOfVideoIndices);

    Row.startRow(builder);
    Row.addTitle(builder, titleOffset);
    Row.addVideos(builder, videosIndex);

    const nextIndex = Row.endRow(builder);
    listOfRowIndices.push(nextIndex);
}

// Note, we could pack the nonsense out of this by first
// serializing the strings for all unique videos and then
// pointing each copy to each video.
const Video = NetflixFBS.Video;
function createVideo(builder, video, listOfIndices) {

    const titleOffset = builder.createString(video.title);
    const synopsisOffset = builder.createString(video.synopsis);
    const altSynopsisOffset = builder.createString(video.altSynopsis);

    Video.startVideo(builder);
    Video.addId(builder, video.id);
    Video.addTitle(builder, titleOffset);
    Video.addSynopsis(builder, synopsisOffset);
    Video.addAltSynopsis(builder, altSynopsisOffset);
    Video.addOriginal(builder, video.original);
    Video.addCount(builder, 0);

    const nextIndex = Video.endVideo(builder);
    listOfIndices.push(nextIndex);

    return nextIndex;
}
