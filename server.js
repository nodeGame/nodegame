/*
 * Launcher file for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server').ServerNode;

var options = {
		confDir: './conf',
		// logDir: './log', // not working at the moment
		servernode: function (servernode) {
			servernode.verbosity = 100;
			servernode.gamesDirs.push('./games');
			return true;
		},
		http: function (http) {
			// Special configuration here
			return true;
		},
		sio: function (sio) {
			// Special configuration here
			return true;
		},
}
// Start server

// Option parameter is optional
var sn = new ServerNode(options);

var mygame = sn.addChannel({
				    name: 'mygame',
				    admin: 'mygame/admin',
				    player: 'mygame',		    	

});

// We can load a game here
var path = require('path');
var mygame = path.resolve('./games/mygame/server/game.daemon.js');
sn.startGame('mygame', mygame);


module.exports = sn;

