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

var ultimatum = sn.addChannel({
				    name: 'Ultimatum',
				    admin: 'ultimatum/admin',
				    player: 'ultimatum',		    	

});

var waitingRoom = sn.addChannel({
				name: 'Wroom',
				admin: 'ultimatum/wait/admin',
				player: 'ultimatum/wait',
				game: 'wait',
});


sn.addChannel({
    name: 'Erroom',
    admin: 'ultimatum/erroom/admin',
    player: 'ultimatum/erroom'
});

			

// We can load a game here
var path = require('path');
var ultimatum = path.resolve('./games/ultimatum/server/ultimatum.logic.4.server.js');
sn.startGame('Ultimatum', ultimatum);


module.exports = sn;

