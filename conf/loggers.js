module.exports = configure;

var path = require('path');

function configure (loggers) {

//	var config = {
//		levels: {
//		    silly: 0,
//		    verbose: 1,
//		    info: 2,
//		    data: 3,
//		    warn: 4,
//		    debug: 5,
//		    error: 6
//		  },
//		colors: {
//		    silly: 'magenta',
//		    verbose: 'cyan',
//		    info: 'green',
//		    data: 'grey',
//		    warn: 'yellow',
//		    debug: 'blue',
//		    error: 'red'
//		  }
//	};

//	var rootDir = path.resolve(__dirname, '..');
//	var logDir = rootDir + '/log/';
//
//	loggers.add('ultimatumchannel', {
//	    console: {
//	    	level: 'silly',
//	    	colorize: true,
//	    },
//	    file: {
//	    	level: 'silly',
//	    	timestamp: true,
//	    	filename: logDir + 'channel',
//	    	maxsize: 1000,
//	    	maxFiles: 10,
//	    },
//	});
//
	return true;
}
