/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Sets conf, log, and games directory and start the server.
 *
 * http://www.nodegame.org
 * ---
 */

// Load the Node.js path object.
var path = require('path');

// Load the ServerNode class.
var ServerNode = require('nodegame-server').ServerNode;

// Overrides some of the default options for ServerNode.
var options = {

    // Additional conf directory.
    confDir: './conf',
    
    // Log Dir
    logDir: './log',
    
    servernode: function(servernode) {
        // Special configuration for the ServerNode object.
        
        // Adds a new game directory (Default is nodegame-server/games).
        servernode.gamesDirs.push('./games');
        // Sets the debug mode, exceptions will be thrown (Default is false).
        servernode.debug = true;

        return true;
    },
    http: function(http) {
        // Special configuration for Express goes here.
        return true;
    },
    sio: function(sio) {
        // Special configuration for Socket.Io goes here here.

        // sio.set('transports', [
        //   'websocket'
        // , 'flashsocket'
        // , 'htmlfile'
        // , 'xhr-polling'
        // , 'jsonp-polling'
        // ]);

        return true;
    }
};

// Start server, options parameter is optional.
var sn = new ServerNode(options);

// Exports the whole ServerNode.
module.exports = sn;
