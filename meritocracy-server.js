/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Starts two channels, one to test the requirements,
 * and one to actually play an Meritocracy game.
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
        // sio.set('log level', 3);
        // Special configuration for Socket.Io goes here here.
        return true;
    }
};

// Start server, option parameter is optional.
var sn = new ServerNode(options);

// Add the game channel.
var meritocracy = sn.addChannel({
    name: 'meritocracy',
    admin: 'meritocracy/admin',
    player: 'meritocracy',
    verbosity: 100,
    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,
    // Unauthorized clients will be redirected here. 
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/meritocracy/unauth.htm'
});

// Creates the room that will spawn the games for the channel.
var logicPath = path.resolve('./games_new/meritocracy/server/game.room.js');
var gameRoom = meritocracy.createWaitingRoom({
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
var logicPath = path.resolve('./games_new/meritocracy/server/requirements.room.js');
var reqRoom = requirements.createWaitingRoom({
    logicPath: logicPath
});


// Exports the whole ServerNode.
module.exports = sn;
