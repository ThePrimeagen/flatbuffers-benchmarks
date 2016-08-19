'use strict';

// TODO: implement unique
function generate(lolomo, unique) {
    if (unique) {
        return collapseLolomoAsFalcor(lolomo);
    }
    return lolomo;
};

module.exports = generate;

// We have to create a lolomo, in JSON, that can be represented as a graph.
// I am going to create a simple graph format that looks like Falcor-ish.
function collapseLolomoAsFalcor(lolomo) {
    const rows = [];
    const videoGraph = {};
    const falcorIsh = {
        id: lolomo.id,
        clientId: lolomo.clientId,
        rows: rows,
        videos: videoGraph
    };

    for (let i = 0; i < lolomo.rows.length; ++i) {
        const row = lolomo.rows[i];
        const videos = [];
        const outRow = {
            title: row.title,
            id: row.id,
            videos: videos
        };
        rows.push(outRow);

        for (let videoIdx = 0; videoIdx < row.videos.length; ++videoIdx) {
            const video = row.videos[videoIdx];
            const videoId = video.id;

            if (!videoGraph[videoId]) {
                videoGraph[videoId] = {$type: 'atom', value: video};
            }

            outRow[i] = {$type: 'ref', value: ['videos', videoId]};
        }
    }

    return falcorIsh;
}

generate.print = function printTestLolomo(lolomo) {
    console.log('JSON', JSON.stringify(lolomo, function __filter(k, v) {
        if (k === 'synopsis' || k === 'altSynopsis') {
            return;
        }
        return v;
    }, 4));
}
