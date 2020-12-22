/**
 * # servernode.js
 *
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Configuration file for ServerNode in nodegame-server.
 * ---
 */
module.exports = configure;

const path = require('path');

function configure(loggers) {

    // Edit this file to modify the default configuration options in:
    // node_modules/nodegame-server/conf/loggers.js

    // For instance:

    //	let config = {
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

    //	let rootDir = path.resolve(__dirname, '..');
    //	let logDir = rootDir + '/log/';
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

    return true;
}
