/*
 * Launcher file for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server').ServerNode;

var options = {
    confDir: './conf',
    // logDir: './log', // not working at the moment
    servernode: function (servernode) {
        // TODO: check if the verbosity property here correctly affects the verbosity of the games in channels
	servernode.verbosity = 100;
	servernode.gamesDirs.push('./games_new');
	return true;
    },
    http: function (http) {
	// Special configuration here
	return true;
    },
    sio: function (sio) {
	// Special configuration here
	return true;
    }
};
// Start server

// Option parameter is optional
var sn = new ServerNode(options);

var pairs = sn.addChannel({
    name: 'pairs',
    admin: 'pairs/admin',
    player: 'pairs',
    verbosity: 100
});

// We can load a game here
var path = require('path');

var logicPath = path.resolve('./games/pairs/server/game.room.js');

var room = pairs.createWaitingRoom({
    logicPath: logicPath
});

module.exports = sn;

