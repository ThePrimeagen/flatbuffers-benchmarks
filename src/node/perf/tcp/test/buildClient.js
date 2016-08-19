const net = require('net');

module.exports = function buildClient(host, port, cb) {
    const opts = {
        port: port,
        host: host
    };
    
    const client = net.connect(opts, function _onClientConnection(e) {
        if (e) {
            throw new Error(e);
        }
        
        cb(null, client);
    });
};

