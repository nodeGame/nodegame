module.exports = configure;

var path = require('path');

function configure (servernode) {
	
	var rootDir = path.resolve(__dirname, '..');
	
	servernode.name = "nodeGame server";
	servernode.verbosity = 10;
	
//	servernode.log.msg = false;
//	servernode.log.sys = false;
//	servernode.log.folder = rootDir + '/log/';
//	
//	servernode.mail = false; // experimental
	

	servernode.defaultGamesDir = rootDir + '/games/';
	servernode.gamesDirs = [servernode.defaultGamesDir];
    
	if (process && process.env.PORT){
		servernode.port = process.env.PORT; // if app is running on heroku then the assigned port has to be used.
	} else {
		servernode.port = '8080'; // port of the express server and sio
	}
	 
	
	servernode.maxChannels = 0; // unlimited
	
	servernode.maxListeners = 0; // unlimited
	
	servernode.defaults.channel = {
			sockets: {
				sio: true,
				direct: true
			},
			port: servernode.port,
			log: servernode.log,
			verbosity: servernode.verbosity,
			notifyPlayers: {
				onConnect: false,
				onStateUpdate: false,
			},
			forwardAllMessages: true,
		};
	
	return true;
}