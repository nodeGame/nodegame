module.exports = configure;

var path = require('path');

function configure (loggers) {
	
	console.log(loggers)
	
	var rootDir = path.resolve(__dirname, '..');
	var logDir = rootDir + '/log/';
	
	loggers.add('servernode', {
	    console: {
	    	level: 'silly',
	    	colorize: true,
	    },
	    file: {
	    	level: 'silly',
	    	timestamp: true,
	    	filename: logDir + 'servernodes/servernode',
	    	maxsize: 1000,
	    	maxFiles: 10,
	    },
	});
	
	loggers.add('channel', {
	    console: {
	    	level: 'silly',
	    	colorize: true,
	    },
	    file: {
	    	level: 'silly',
	    	timestamp: true,
	    	filename: logDir + 'channels/channel',
	    	maxsize: 1000,
	    	maxFiles: 10,
	    },
	});
	
	
	loggers.add('messages', {
	    file: {
	    	level: 'silly',
	    	timestamp: true,
	    	filename: logDir + 'messages/message',
	    },
	});
	
	
    
	
	return true;
}