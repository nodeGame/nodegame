/**
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('./nodegame-server');

var options = { 
				name: "nodeGame Server",
				port: 8004,
				dump: true,
				mail: false
};

// ServerNode accepts two additional parameters:
// - an instance of an http Express server
// - an instance of socket.io
// If not passed, they will be created with default settings
var sn = new ServerNode(options);

sn.addChannel({
				name: 'pr',
			  	admin: 'peerreview/admin',
			  	player: 'peerreview'
});

sn.addChannel({
				name: 'example',
				admin: 'examplegame/admin',
				player: 'examplegame'
});

sn.addChannel({
				name: 'ultimatum',
				admin: 'ultimatum/admin',
				player: 'ultimatum'
});