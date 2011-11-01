module.exports = AdminServer;

var util = require('util');
var EventEmitter = require('events').EventEmitter;


var Utils = require('./Utils');
var ServerLog = require('./ServerLog');

var GameMsg = require('./GameMsg');
var GameMsgManager = require('./GameMsgManager');
var PlayerList = require('./PlayerList').PlayerList;
var Player = require('./PlayerList').Player;
var GameServer = require('./GameServer');

AdminServer.prototype.__proto__ = GameServer.prototype;
AdminServer.prototype.constructor = AdminServer;

function AdminServer(options) {
	GameServer.call(this,options);	
}

AdminServer.prototype.attachCustomListeners = function() {	
	var that = this;
	var log = this.log;
	var say = GameMsg.actions.SAY + '.';
	var set = GameMsg.actions.SET + '.';
	var get = GameMsg.actions.GET + '.'; 
	
	this.on(say+'HI', function(msg) {
		console.log(that.name + ' ----------------- Got ' + msg.toEvent());
		// Add the player to to the list
		that.pl.addPlayer(msg.data);
		// Tell everybody a new player is connected;
		var connected = new Player(msg.data) + ' connected.';
		this.gmm.sendTXT(connected,'ALL');
		// Send the list of connected partners
		that.gmm.sendPLIST(that.partner, msg.from);
	});

	this.on(say+'TXT', function(msg) {
		that.gmm.forwardTXT (msg.text, msg.to);
		that.gmm.sendTXT(msg.from + ' sent MSG to ' + msg.to, 'ALL');
	});

	this.on(say+'DATA', function(msg) { 
		that.gmm.forwardDATA (msg.data, msg.to, msg.text);
		that.gmm.sendTXT(msg.from + ' sent DATA to ' + msg.to, 'ALL');
	});

	
	// SET
	
	this.on(set+'STATE', function(msg){
		if (!that.checkSync) {
			that.gmm.sendTXT('**Not possible to change state: some players are not ready**', msg.from);
		}
		else {
			//that.log.log('----------------onSTATE.ADMIN: ' + util.inspect(msg));
			// Send it to players and other monitors
			that.gmm.forwardSTATE (GameMsg.actions.SET,msg.data, msg.to);
			that.gmm.sendSTATE (GameMsg.actions.SET,msg.data, msg.to);
		}
	});
		
	
	this.on(get+'MEMORY', function(msg){
		that.gmm.sendDATA(this.dumpMemory());
	});
};