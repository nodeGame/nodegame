/// RUN

var NDDB = require('NDDB').NDDB,
	node = require('nodegame-client'),
	JSUS = node.JSUS;

module.exports = node;

var Ultimatum = require('./ultimatum.logic');


var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum/admin",
//	io: {
//	    'reconnect': false,
//	    'transports': ['xhr-polling'],
//	    'polling duration': 10
//	},
	verbosity: 10,

};
		
node.setup('socket', {
	type: 'SocketIo'
});
		
//node.socket.setSocketType('SocketIo');

node.verbosity = 100;


//for (var i=1; i < 10000000; i++) {}

node.connect(conf.url);		   



//for (var i=1; i < 10000000; i++) {}



node.play(new Ultimatum());

//node.game.step();
module.exports = node;
