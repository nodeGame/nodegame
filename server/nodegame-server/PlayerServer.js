module.exports = PlayerServer;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var ServerLog = require('./ServerLog');
var GameServer = require('./GameServer');
var GameMsgManager = require('./GameMsgManager');


var Utils = require('nodegame-client').Utils;
var GameState = require('nodegame-client').GameState;
var GameMsg = require('nodegame-client').GameMsg;

var PlayerList = require('nodegame-client').PlayerList;
var Player = require('nodegame-client').Player;

PlayerServer.prototype.__proto__ = GameServer.prototype;
PlayerServer.prototype.constructor = PlayerServer;

function PlayerServer(options) {
	GameServer.call(this,options);
}

//PlayerServer passes the id of the sender when forwarding msgs

PlayerServer.prototype.attachCustomListeners = function() {
	var that = this;
	var log = this.log;
	var say = GameMsg.actions.SAY + '.';
	var set = GameMsg.actions.SET + '.';
	var get = GameMsg.actions.GET + '.'; 
	
    this.on(say+'HI', function(msg) {
    	that.pl.addPlayer(msg.data);
        // TODO: check if we need to do it
    	that.gmm.sendPLIST(that); // Send the list of players to all the clients
    	
    	// Send PL to monitors
        that.gmm.forwardPLIST(that);
	});
	
    this.on(say+'TXT', function(msg) {
		// Personal msg
		// TODO: maybe checked before?
    	if (that.isValidRecipient(msg.to)){
			that.gmm.send (msg);
		}
	});
			
    this.on(say+'DATA', function(msg) {
		// Personal msg
		// TODO: maybe checked before?
    	if (that.isValidRecipient(msg.to)){
			that.gmm.send(msg);
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
    
    // Set
    
    this.on(set+'DATA', function(msg) {
    	
		// Personal msg
		// TODO: maybe checked before?
    	if (that.isValidRecipient(msg.to)){
			that.gmm.send(msg);
		}
		else {
			that.gmm.forward (msg);
		}
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