/**
 * # sio.js
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Configuration file for the Socket.io server in nodegame-server.
 * ---
 */
module.exports = configure;

function configure(sio, servernode) {
    // Nothing extra to configure.
    // Default configuration set already in:
    // node_modules/nodegame-server/conf/sio.js
    return true;
};
