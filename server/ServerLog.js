// Logs

var sys = require("sys");
var fs = require('fs');

var Utils = require('./Utils');

module.exports = ServerLog;

function ServerLog(options) {
	
	this.name = options.name || 'Noname';
	
	this.dumpmsg = options.dumpmsg || 0;
	
	this.sysfile = options.sysfile || 'log/syslog';
	this.msgfile = options.msgfile || 'log/messages';
	
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