/*
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server').ServerNode;

var options = {
    name: "nodeGame Server",
    port: 8080,
    verbosity: 10,
    dumpsys: false,
    dumpmsg: false,
    mail: false,
    io: {
        set: {
//            'transports': ['xhr-polling'],
//            'polling duration': 10,
//            'log level': 10
        },
        reconnect: false,
    },
    http: {},
    gamesDirs: './games/',
    auth: myAuthFunc, // every client that connects to the server
    				  // is checked through this function
    
    
};


var myAuthFunc = function() {
	return true;
};

// ServerNode accepts two additional parameters:
// - an instance of an http Express server
// - an instance of socket.io
// If not passed, they will be created with default settings
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

			
