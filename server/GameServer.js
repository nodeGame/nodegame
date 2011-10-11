/*
 * GameServer
 * 
 * Wrapper class for ws server, log, player list, and msg manager
 * 
 */

module.exports = GameServer;

var util = require('util');
var ws = require("websocket-server");
var EventEmitter = require('events').EventEmitter;


var Utils = require('./Utils');
var ServerLog = require('./ServerLog');

var GameMsg = require('./GameMsg');
var GameMsgManager = require('./GameMsgManager');
var PlayerList = require('./PlayerList').PlayerList;
var Player = require('./PlayerList').Player;

function GameServer() {}


GameServer.prototype.setPartner = function(node) {
	this.partner = node;
};

/*
 * Creates a new WS server and adds it to the Arraylist of servers
 */
GameServer.prototype.listen = function() {
	
	// server was actually created somewhere else
	this.server.listen(this.port);
	this.log.log(this.server);
	this.attachListeners();
}; 

//Parse the message newly received in the Socket
GameServer.prototype.secureParse = function (e) {
	
	var msg = new GameMsg(null); // the newly received msg
	
	try {	
		msg.clone(JSON.parse(e));
		this.log.msg('R, ' + msg);
	}
	catch(e) {
		this.log.log("Malformed msg received: " + e, 'ERR');
	}
	
	return msg;
};

GameServer.prototype.checkSync = function() {
	
	// TODO: complete function checkSync
	
	return true;
};

GameServer.prototype.getConnections = function() {
	var list =  this.server.manager.map( function(client) {
		//console.log('STATE CONN ' + client.id + ' : '+ client._state);
		if (client._state < 5) {// connected
			return client.id;
		}
	});
	return list;
}; 