'use strict';

const programArgs = require('../../programArgs');
const toBuffer = require('../../toBuffer');
const AsAService = require('./AsAService');

const TCPWrapper = function _TCPWrapper(parsedTCP, name) {
    this._parsedTCP = parsedTCP;
    const memoMap = this._memoMap = {};
    const callerMap = this._callerMap = {};

    parsedTCP.
        on('data', function _onData(data) {
            const clientId = data.clientId;
            const memo = memoMap[clientId];
            const caller = callerMap[clientId];

            if (caller) {
                caller.onData(memo, data);
                memoMap[clientId] = undefined;
                callerMap[clientId] = undefined;
            }
        }).
        on('error', function _onError(e) {
            console.log('TCPWrapper#onError#', name, e.message);
            console.log('TCPWrapper#onError#', name, e.stack);
        }).
        on('end', function _onComplete() {
            console.log('TCPWrapper#onComplete#', name);
        });
};

module.exports = TCPWrapper;

/**
 * @param {{onData: function}} caller
 */
TCPWrapper.prototype.write = function write(buffer, memo, caller) {
    this._memoMap[memo.clientId] = memo;
    this._callerMap[memo.clientId] = caller;
    this._parsedTCP.write(buffer);
};

