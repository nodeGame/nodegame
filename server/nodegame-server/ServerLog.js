// Logs

var sys = require("sys");
var fs = require('fs');
var path = require('path');

var Utils = require('nodegame-client').Utils;

module.exports = ServerLog;

function ServerLog(options) {
	
	this.name = options.name || 'Noname';
	this.dumpmsg = options.dumpmsg || 0;
	this.logdir = path.normalize(options.logdir || 'log');
	this.logdir = path.resolve(this.logdir);
		
	this.checkLogDir();
	
	this.sysfile = path.normalize(options.sysfile || this.logdir + '/syslog');
	this.msgfile = path.normalize(options.msgfile || this.logdir + '/messages');
	
	try {
		this.logSysStream = fs.createWriteStream( this.sysfile, {'flags': 'a'});
		
		if (this.dumpmsg) {
			try {
				this.logMsgStream = fs.createWriteStream( this.msgfile, {'flags': 'a'});
				this.log('Log of Messages active');
			}
			catch (e) {
				this.log('Msg Log could not be started');
			}
		}
	}
	catch(e) {
		console.log('Log service could not be started ' + e);
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

ServerLog.prototype.log = function (text, type) {	
	this.console(text,type);
	this.sys(text,type);
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
		
	sys.log("\033[" + ATT + this.name + '\t' + data.toString() + "\033[0m");
};


ServerLog.prototype.msg = function(gameMsg, type) {	
	if (this.logMsgStream) {
		this.logMsgStream.write(this.name + ',\t' + gameMsg);
	}
};

ServerLog.prototype.sys = function(text, type) {
	var text = Utils.getDate() + ', ' + this.name + ' ' + text;
	this.logSysStream.write(text + '\n');	
};

ServerLog.prototype.close = function() {
	this.logSysStream.close();
	if (this.logMsgStream) {
		this.logMsgStream.close();
	}
};