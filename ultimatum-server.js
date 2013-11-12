/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Starts a channel with playing an Ultimatum game.
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
    confDir: './conf',
    // logDir: './log', // not working at the moment
    servernode: function(servernode) {
        // Special configuration for the ServerNode object.
        // TODO: check if the verbosity property here correctly
        // affects the verbosity of the games in channels
        servernode.verbosity = 100;
        servernode.gamesDirs.push('./games_new');
        return true;
    },
    http: function(http) {
        // Special configuration for Express goes here
        return true;
    },
    sio: function(sio) {
        // Special configuration for Socket.Io goes here here.
        return true;
    }
};

// Start server, option parameter is optional.
var sn = new ServerNode(options);


// Add a channel to the server.
var feedback = sn.addChannel({
    name: 'feedback',
    admin: 'feedback/admin',
    player: 'feedback',
    verbosity: 100,
    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: false
});



// Add a channel to the server.
var ultimatum = sn.addChannel({
    name: 'ultimatum',
    admin: 'ultimatum/admin',
    player: 'ultimatum',
    verbosity: 100,
    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true
});

// Creates the waiting room for the channel.
var logicPath = path.resolve('./games_new/ultimatum/server/requirements.room.js');
var room = ultimatum.createWaitingRoom({
    logicPath: logicPath
});

// Creates the room that will spawn the games for the channel
var logicPath = path.resolve('./games_new/ultimatum/server/game.room.js');
var room = ultimatum.createGameRoom({
    logicPath: logicPath,
    name: 'gameRoom'
});

// Exports the whole ServerNode.
module.exports = sn;
