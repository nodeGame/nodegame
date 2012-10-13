/*
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server').ServerNode;

var options = {
		confDir: './conf',
		servernode: function (servernode) {
			servernode.verbosity = 10;
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

// all input parameters are optional
var sn = new ServerNode(options);

var ultimatum = sn.addChannel({
				    name: 'Ultimatum',
				    admin: 'ultimatum/admin',
				    player: 'ultimatum',
				    game: 'ultimatum',		    	
});

var waitingRoom = sn.addChannel({
				name: 'Wroom',
				admin: 'ultimatum/wait/admin',
				player: 'ultimatum/wait',
				game: 'wait',
});



			
