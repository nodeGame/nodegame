var	node = require('nodegame-client'),
	JSUS = node.JSUS;



var conf = {
	url: "http://localhost:8080/ultimatum/admin",
	verbosity: 10,
};


node.setup(conf);
		
node.setup('socket', {
	type: 'SocketIo'
});
		
node.socket.setSocketType('SocketIo');
node.connect(conf.url);		   


var gameClient = require('./ultimatum.client');

console.log(gameClient);

node.remoteSetup('game', {game: gameClient}, 'ALL');

node.remoteSetup('env', {fru2: true}, 'ALL');

