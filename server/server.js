/**
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('./nodegame-server');




//io.configure('production', function(){
//	  that.server.enable('browser client etag');
//	  that.server.set('log level', 3);
//	});


var options = { 
				name: "nodeGame Server",
				port: 8004,
				nPlayers: 4,
				admin: 'admin',
				player: 'player',
				dump: true,
				mail: false
			  };

// The second parameter is optional. If missing, the socket will be created for you
var sn = new ServerNode(options);
sn.listen();


