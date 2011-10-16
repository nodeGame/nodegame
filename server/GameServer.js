/*
 * GameServer
 * 
 * Wrapper class for ws server, log, player list, and msg manager
 * 
 */

module.exports = GameServer;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(GameServer,EventEmitter);


var Utils = require('./Utils');
var ServerLog = require('./ServerLog');

var GameMsg = require('./GameMsg');
var GameMsgManager = require('./GameMsgManager');
var PlayerList = require('./PlayerList').PlayerList;
var Player = require('./PlayerList').Player;

function GameServer(options) {
	
	EventEmitter.call(this);
	
	this.io = options.io;
	this.channel = '/' +  options.channel;
	this.socket = null; // to be init after a connection is created
	
	this.port = options.port;
	
	this.name = options.name;
	
	var dumpmsg = options.dumpmsg || true;
	
	this.log = new ServerLog ({name: this.name, dumpmsg: dumpmsg});
	
	this.server = options.server;
	
	this.gmm = new GameMsgManager(this);
	
	this.pl = new PlayerList();
	
	this.partner = null;
}

GameServer.prototype.setPartner = function(node) {
	this.partner = node;
};

/**
 * Attach standard and custom listeners to the server.
 * 
 */
GameServer.prototype.listen = function() {
	this.attachListeners();
	this.attachCustomListeners();
}; 

//Parse the newly received message
GameServer.prototype.secureParse = function (msg) {
	
	try {
		var gameMsg = GameMsg.clone(JSON.parse(msg));
		this.log.msg('R, ' + gameMsg);
		return gameMsg;
	}
	catch(e) {
		this.log.log("Malformed msg received: " + e, 'ERR');
		return false;
	}
	
};

//GameServer.prototype.secureParse = function (msg) {
//	
//	var gameMsg = new GameMsg(null);
//	
//	try {	
//		// TODO: use a static method or GameMsg.parse ?
//		gameMsg.clone(JSON.parse(msg));
//		this.log.msg('R, ' + gameMsg);
//	}
//	catch(e) {
//		this.log.log("Malformed msg received: " + e, 'ERR');
//	}
//	
//	return gameMsg;
//};



GameServer.prototype.attachListeners = function() {
	var that = this;
	var log = this.log;
	
	log.log('Listening for connections');
	
	this.channel = this.server
	  .of(this.channel)
	  .on('connection', function (socket) {  
		// Register the socket as a class variable
		that.socket = socket;
				
		// Send Welcome Msg and notify others
		that.welcomeClient(socket.id);		
			
		socket.on('message', function(message){
			
			var msg = that.secureParse(message);
			
			if (msg) { // Parsing Successful
				//that.log.log('JUST RECEIVED P ' + util.inspect(msg));
				
				// TODO: KEEP THE FORWADING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ?
				//that.gmm.forward(msg);
				console.log(that.name + ' About to emit ' + msg.toEvent());
				
				that.log.log(msg.toEvent() + ' ' + msg.to + '-> ' + msg.from);	
				that.emit(msg.toEvent(), msg);
			}
		});
	
		
		socket.on('disconnect', function() {
			that.gmm.sendTXT("<"+socket.id+"> closed", 'ALL');
			log.log("<"+socket.id+"> closed");
			// Notify all server
			that.emit('closed', socket.id);
		});
		
	});
	
	
	
	// TODO: Check this
	this.server.sockets.on("shutdown", function(message) {
		log.log("Server is shutting down.");
		that.pl.pl = {};
		that.gmm.sendPLIST(that);
		log.close();
	});
};

// Will be overwritten
GameServer.prototype.attachCustomListeners = function() {}

GameServer.prototype.welcomeClient = function(client) {
	var connStr = "Welcome <" + client + ">";
	this.log.log(connStr);
	
	// Send HI msg to the newly connected client
	this.gmm.sendHI(connStr, client);
}

GameServer.prototype.checkSync = function() {
	// TODO: complete function checkSync
	return true;
};

GameServer.prototype.getConnections = function() {

	var clientids = [];
	for (var i in this.channel.sockets) {
		if (this.channel.sockets.hasOwnProperty(i)) {
			clientids.push(i);
			console.log(i);
		}
	}
	return clientids;
}; 