/**
 * # Configuration file for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Starts two channels, one to test the requirements,
 * and one to actually play an Ultimatum game.
 *
 * http://www.nodegame.org
 * ---
 */

// Load the ServerNode class.
var ServerNode = require('nodegame-server').ServerNode;

// Overrides some of the default options for ServerNode.
var config = {
    // Additional conf directory.
    confDir: './conf',
    // logDir: './log', // not working at the moment
    servernode: function(servernode) {
        // Special configuration for the ServerNode object.
        
        // Adds a new game directory (Default is nodegame-server/games).
        servernode.gamesDirs.push('./games');
        // Sets the debug mode, exceptions will be thrown (Default is false).
        servernode.debug = false;
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

// Start server, config parameter is optional.
var sn = new ServerNode(config);
sn.debug = true;

sn.ready(function() {

    // Get the absolute path to the game directory.
    var ultimatumPath = sn.resolveGameDir('ultimatum');
    if (!ultimatumPath) {
        throw new Error('Ultimatum game not found.');
    }

    // Add the game channel.
    var ultimatum = sn.addChannel({
        name: 'ultimatum',
        admin: 'ultimatum/admin',
        player: 'ultimatum',
        verbosity: 100,
        // If TRUE, players can invoke GET commands on admins.
        getFromAdmins: true,
        // Unauthorized clients will be redirected here. 
        // (defaults: "/pages/accessdenied.htm")
        accessDeniedUrl: '/ultimatum/unauth.htm'
    });

    // Creates the room that will spawn the games for the channel.
    var gameRoom = ultimatum.createWaitingRoom({
        logicPath:  ultimatumPath + 'server/game.room.js',
        name: 'waitRoom'
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
    var reqRoom = requirements.createWaitingRoom({
        logicPath: ultimatumPath + 'server/requirements.room.js',
        name: 'requirementsWR'
    });

});

// Exports the whole ServerNode.
module.exports = sn;
