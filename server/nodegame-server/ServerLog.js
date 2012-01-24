// Logs

var util = require('util');
var fs = require('fs');
var path = require('path');

var Utils = require('nodegame-client').Utils;

ServerLog.verbosity_levels = require('nodegame-client').verbosity_levels;

module.exports = ServerLog;

function ServerLog (options) {
	
	this.name = options.name || 'Noname';
	this.verbosity = ('undefined' !== typeof options.verbosity) ? options.verbosity : 1;
	this.dumpmsg = ('undefined' !== typeof options.dumpmsg) ? options.dumpmsg : false;
	this.dumpsys = ('undefined' !== typeof options.dumpsys) ? options.dumpsys : true;
	this.logdir = path.normalize(options.logdir || 'log');
	this.logdir = path.resolve(this.logdir);
		
	this.checkLogDir();
	
	this.sysfile = path.normalize(options.sysfile || this.logdir + '/syslog');
	this.msgfile = path.normalize(options.msgfile || this.logdir + '/messages');
			
	if (this.dumpsys) {
		try {
			this.logSysStream = fs.createWriteStream( this.sysfile, {'flags': 'a'});
			this.log('Log of System Messages active');
		}
		catch (e) {
			this.log('System Messages log could not be started');
		}
	}
	
	if (this.dumpmsg) {
		try {
			this.logMsgStream = fs.createWriteStream( this.msgfile, {'flags': 'a'});
			this.log('Log of Messages active');
		}
		catch (e) {
			this.log('Msg Log could not be started');
		}
	}	
};

/**
 * Creates the log directory if not existing.
 * 
 */
ServerLog.prototype.checkLogDir = function() {
	//console.log('logdir ' + this.logdir);
	if (!path.existsSync(this.logdir)) {
		fs.mkdirSync('log/', 0755);
	}
}

ServerLog.prototype.log = function (text, level) {
	var level = level || 0;
	if ('string' === typeof level) {
		var level = ServerLog.verbosity_levels[level];
	}
	if (this.verbosity > level) {
		this.console(text);
		if (this.logSysStream) {
			this.sys(text,level);
		}
	}
};


ServerLog.prototype.console = function(data, type){
	
	var ATT = '0;32m'; // green text;
	
	switch (type) {
		
		case 'ERR':
			ATT = '0;31m'; // red text;
			break;
			
		case 'WARN':
			ATT = '0;37m'; // gray text;
			break;
	}
		
	util.log("\033[" + ATT + this.name + '\t' + data.toString() + "\033[0m");
};


ServerLog.prototype.msg = function(gameMsg, type) {	
	if (this.logMsgStream) {
		this.logMsgStream.write(this.name + ',\t' + gameMsg);
	}
};

ServerLog.prototype.sys = function(text, type) {
	if (this.logSysStream) {
		var text = Utils.getDate() + ', ' + this.name + ' ' + text;
		this.logSysStream.write(text + '\n');	
	}
};

ServerLog.prototype.close = function() {
	this.logSysStream.close();
	if (this.logMsgStream) {
		this.logMsgStream.close();
	}
};