/**
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('./nodegame-server');

var options = { 
				name: "nodeGame Server",
				port: 8080,
				verbosity: -1,
				dumpsys: false,
				dumpmsg: false,
				mail: false
};

// ServerNode accepts two additional parameters:
// - an instance of an http Express server
// - an instance of socket.io
// If not passed, they will be created with default settings
var sn = new ServerNode(options);

sn.addChannel({
				name: '2',
			  	admin: 'ultimatum2/admin',
			  	player: 'ultimatum2'
});

//sn.addChannel({
//				name: '3',
//				admin: 'ultimatum3/admin',
//				player: 'ultimatum3'
//});

//sn.addChannel({
//				name: '4',
//				admin: 'ultimatum4/admin',
//				player: 'ultimatum4'
//});


sn.addChannel({
        name: 'pr',
        admin: 'pr/admin',
        player: 'pr'
});

