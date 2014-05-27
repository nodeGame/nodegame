/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Starts two channels, one to test the requirements,
 * and one to actually play a Face Categorization game.
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
    // logDir: './log', // not working at the moment
    servernode: function(servernode) {
        // Special configuration for the ServerNode object.
        
        // Adds a new game directory (Default is nodegame-server/games).
        servernode.gamesDirs.push('./games_new');
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
        return true;
    }
};

// Start server, option parameter is optional.
var sn = new ServerNode(options);

// Add the game channel.
var facerank = sn.addChannel({
    // Options in common to admin and player server.

    name: 'facerank',
    // Unauthorized clients will be redirected here. 
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/facerank/unauth.htm',

    // PlayerServer options.
    player: {
        endpoint: 'facerank',
        // If TRUE, players can invoke GET commands on admins.
        getFromAdmins: true,
        notify: {
            onConnect: false,
            onStageUpdate: false,
            onStageLevelUpdate: false,
            onStageLoadedUpdate: false
        }
    },

    // AdminServer options (all defaults).
    admin: 'facerank/admin'
});

// Creates the room that will spawn the games for the channel.
var logicPath = path.resolve('./games_new/facerank/server/game.room.js');
var gameRoom = facerank.createWaitingRoom({
    logicPath: logicPath,
    name: 'gameRoom'
});

// Add a requirements-check / feedback channel.
var requirements = sn.addChannel({
    name: 'requirements',
    admin: 'requirements/admin',
    player: 'requirements',
    verbosity: 100,
    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true
});

// Creates the waiting room for the channel.
var logicPath = path.resolve('./games_new/facerank/server/requirements.room.js');
var reqRoom = requirements.createWaitingRoom({
    logicPath: logicPath
});


// Exports the whole ServerNode.
module.exports = sn;
