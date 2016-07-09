'use strict';

const IS_SERVER = process.env.IS_SERVER || true;

console.log('isServer', IS_SERVER, typeof IS_SERVER);
let isServer = true;
if (typeof IS_SERVER === 'string') {
    isServer = IS_SERVER === 'true';
}

console.log('About to start', isServer, typeof isServer);
if (isServer) {
    require('./server');
}

else {
    require('./client');
}
