'use strict';

module.exports = function _recieveJSON(client, jsonOrBuffer) {
    let json = jsonOrBuffer;

    // create an object.
    if (jsonOrBuffer instanceof Buffer) {
        json = JSON.parse(jsonOrBuffer.toString());
    }

    else if (!jsonOrBuffer) {
        json = {
            type: 'hello',
            count: -1
        };
    }

    json.count++;

    const jsonStr = JSON.stringify(json);
    const buf = new Buffer(jsonStr.length + 4);
    buf.writeUInt32LE(jsonStr.length, 0);
    buf.write(jsonStr, 4);
    client.write(buf);
}
