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
				dump: true,
				mail: false
};

var sn = new ServerNode(options);

sn.addChannel({
			  admin: 'admin',
			  player: 'player'
});


