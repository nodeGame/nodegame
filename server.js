/*
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server').ServerNode;

var options = {
    name: "nodeGame Server",
    port: 8080,
    verbosity: 0,
    dumpsys: false,
    dumpmsg: false,
    mail: false,
    io: {
//        set: {
//            'transports': ['xhr-polling'],
//            'polling duration': 10,
//            'log level': -1
//        },
        reconnect: false,
    },
    http: {}
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
