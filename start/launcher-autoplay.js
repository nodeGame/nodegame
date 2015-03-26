/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets conf, log, and games directory and start the server.
 *
 * http://www.nodegame.org
 */

// Load the Node.js path object.
var path = require('path');

// Load the ServerNode class.
var ServerNode = require('nodegame-server').ServerNode;

// Load the test settings.
var testSettings = require('./settings.js');

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
        sio.set('transports', testSettings.sioTransports);
        return true;
    }
};

// Start server, options parameter is optional.
var sn = new ServerNode(options);
sn.ready(function() {
    var i, n, phantoms, handleGameover;
    var numFinished;

    n = testSettings.numPlayers;
    phantoms = [];
    for (i = 0; i < n; ++i) {
        console.log('Connecting autoplay-bot #', i+1, '/', n);
        phantoms[i] = sn.channels.ultimatum.connectPhantom();
    }

    // TODO: Listen for room creation instead of timeout.
    //setTimeout(function() {
    //    var node;
    //    node = sn.channels.ultimatum.gameRooms["ultimatum1"].node;
    //    node.events.ee.ng.on(
    //        'GAME_OVER', function() {console.log('The game is over now.');});
    //}, 5000);

    handleGameover = function() {
        console.log('Ultimatum game has run successfully.');
        process.exit();
    };

    // Wait for all PhantomJS processes to exit, then stop the server.
    numFinished = 0;
    for (i = 0; i < n; ++i) {
        phantoms[i].on('exit', function(code) {
            numFinished ++;
            if (numFinished == n) {
                handleGameover();
            }
        });
    }
});

// Exports the whole ServerNode.
module.exports = sn;
