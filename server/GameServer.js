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
	
	this.log = new ServerLog ({name: this.name, "dumpmsg": dumpmsg});
	
	this.server = options.server;
	
	this.gmm = new GameMsgManager(this);
	
	this.pl = new PlayerList();
	
	this.partner = null;
}

GameServer.prototype.setPartner = function(node) {
	this.partner = node;
};

/*
 * Creates a new WS server and adds it to the Arraylist of servers
 */
GameServer.prototype.listen = function() {
	//this.server = io.listen(this.port);
	//this.log.log(this.server);
	this.attachListeners();
}; 

//Parse the newly received message
GameServer.prototype.secureParse = function (msg) {
	
	//this.log.msg('BEFORE PARSING ' + gameMsg);
	
	var gameMsg = new GameMsg(null);
	
	try {	
		// TODO: use a static method or GameMsg.parse ?
		gameMsg.clone(JSON.parse(msg));
		this.log.msg('R, ' + gameMsg);
	}
	catch(e) {
		this.log.log("Malformed msg received: " + e, 'ERR');
	}
	
	return gameMsg;
};

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