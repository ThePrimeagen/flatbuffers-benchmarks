module.exports = function reportTime(start, end) {
    var s = start[0] * 1000000 + start[1] / 1000;
    var e = end[0] * 1000000 + end[1] / 1000;

    // reports the high resolution millis
    console.log('Time taken', (end - start) / 1000);
}
