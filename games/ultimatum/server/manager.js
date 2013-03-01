var	JSUS = require('JSUS').JSUS,
	node = require('nodegame-client');
	

var conf = {
	url: "http://localhost:8080/ultimatum/admin",
	verbosity: 100,
};


node.setup(conf);
		
node.setup('socket', {
	type: 'SocketIo'
});
		
node.socket.setSocketType('SocketIo');
node.connect(conf.url);		   


var gameClient = require('./ultimatum.client');

//console.log(gameClient);

var strGameClient = JSUS.stringify(gameClient, 2);

node.remoteSetup('game', strGameClient, 'ALL');

var msg = node.msg.create({
				action: node.action.SAY,
				target: 'GAMECOMMAND',
				data: {},
				text: 'start',
				to: 'ALL'
			});

node.socket.send(msg);


//node.remoteSetup('env', {fru2: true}, 'ALL');
module.exports = node;
