module.exports = PlayerServer;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Utils = require('./Utils');
var ServerLog = require('./ServerLog');

var GameMsg = require('./GameMsg');
var GameMsgManager = require('./GameMsgManager');
var PlayerList = require('./PlayerList').PlayerList;
var Player = require('./PlayerList').Player;
var GameServer = require('./GameServer');

PlayerServer.prototype.__proto__ = GameServer.prototype;
PlayerServer.prototype.constructor = PlayerServer;

function PlayerServer(options) {
	GameServer.call(this,options);
}

PlayerServer.prototype.attachCustomListeners = function() {
	var that = this;
	var log = this.log;
	var say = GameMsg.actions.SAY + '.';
	var set = GameMsg.actions.SET + '.';
	var get = GameMsg.actions.GET + '.'; 
	
    this.on(say+'HI', function(msg) {
    	console.log(that.name + ' ----------------- Got ' + msg.toEvent());
    	that.pl.addPlayer(msg.data);
        // TODO: check if we need to do it
    	that.gmm.sendPLIST(that); // Send the list of players to all the clients
    	
    	// Send PL to monitors
        that.gmm.forwardPLIST(that);
	});
	
    this.on(say+'TXT', function(msg) {
		// Personal msg
		// TODO: maybe checked before?
		if (msg.to !== null || msg.to || 'SERVER'){
			that.gmm.sendTXT (msg.text, msg.to);
		}
	});
			
    this.on(say+'DATA', function(msg) {
		// Personal msg
		// TODO: maybe checked before?
		if (msg.to !== null || msg.to || 'SERVER'){
			that.gmm.sendDATA (msg.data, msg.to, msg.text);
		}
	});
	
    this.on(say+'STATE', function(msg) {
		
		//that.log.log('onSTATE P ' + util.inspect(msg));
		var player = that.pl.get(msg.from);
		if (player){
			player.updateState(msg.data);

			that.gmm.sendPLIST(that);
			
			that.gmm.forwardPLIST(that);
		}
	});	
	
    
    this.on(get+'MEMORY', function(msg) {
    	
    });
    
    
    this.on('closed', function(id) {
      	console.log(that.name + ' ----------------- Got Closed ' + id);
    	that.pl.remove(id);
    	that.gmm.sendPLIST(that);
    });
	
	// TODO: Check this
	this.server.sockets.on("shutdown", function(message) {
		log.log("Server is shutting down.");
		that.pl.pl = {};
		that.gmm.sendPLIST(that);
		log.close();
	});
};