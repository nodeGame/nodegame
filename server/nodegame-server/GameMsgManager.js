module.exports = GameMsgManager;

var util = require('util');

var GameMsgGenerator = require('./GameMsgGenerator');

var GameState = require('nodegame-client').GameState;
var GameMsg = require('nodegame-client').GameMsg;


function GameMsgManager(node) {
	
	this.name = node.name || 'GenericSender';
	this.session = Math.floor(Math.random()*10000);
	this.currentState =  node.currentState || new GameState(); // TODO: Check what is best to init
	
	this.node = node;
	this.log = node.log;
	this.server = node.server;
	this.socket = node.socket;
	
	this.gmg = new GameMsgGenerator(this.session,this.name,this.currentState);	// TODO: Check what is best to init
}

GameMsgManager.prototype.sendHI = function(text,to) {
	var msg = this.gmg.createHI(text,to);
	this.send(msg); 
};

GameMsgManager.prototype.sendTXT = function(text,to) {
	var msg = this.gmg.createTXT(text,to);
	this.send(msg); 
};

GameMsgManager.prototype.sendPLIST = function(node,to) {
	var recipient = to || 'ALL';
	// TODO: set/get/say choose carefully
	var plMsg = this.gmg.createPLIST(GameMsg.actions.SAY, node.pl, recipient);
	this.send(plMsg);
};

GameMsgManager.prototype.sendSTATE = function(action,state,to) {
	var recipient = to || 'ALL';
	// TODO: set/get/say choose carefully
	var stateMsg = this.gmg.createSTATE(action, state, recipient);
	this.send(stateMsg);
};

GameMsgManager.prototype.sendDATA = function (action,data,to,text) {
	var recipient = to || 'ALL';
	var dataMsg = this.gmg.createDATA(action, data, recipient,text);
	this.send(dataMsg);
};

GameMsgManager.prototype.send = function(gameMsg) {
	
	var to = gameMsg.to;
	var rel = gameMsg.reliable;
	var msg = gameMsg.stringify();
	
	if (to === 'SERVER' || to === null) {
		this.log.log('E, Trying to send msg to nobody: ' + to, 'ERR');
		return false;
	}
	
	// Broadcast
	if (to === 'ALL') {
		if (rel) {
			this.node.channel.json.send(msg);
		} 
		else {
//			var v =  this.node.channel;
//			for (var i in v) {
//				if (v.hasOwnProperty(i)){
//					console.log(v[i]);
//				}
//			}
			this.node.channel.volatile.json.send(msg);
			//this.node.channel.broadcast.volatile.json.send(msg);
		}
		this.log.log('Msg ' + gameMsg.toSMS() + ' broadcasted to ' + to);
		this.log.msg('B, ' + gameMsg);
	}
	// Send to a specific client
	else {
		var client = this.node.channel.sockets[to]; 
		
		if (client) {
			if (rel) {
				client.json.send(msg);
			}
			else {
				client.volatile.json.send(msg);
			}
			this.log.log('Msg ' + gameMsg.toSMS() + ' sent to ' + to);
			this.log.msg('S, ' + gameMsg);
		}
		else {
			this.log.log('Msg not sent. Unexisting recipient: ' + to, 'ERR');
		}
	}
};

// FORWARD

GameMsgManager.prototype.forwardHI = function(text,to) {
	var msg = this.gmg.createHI(text,to);
	this.forward(msg); 
};

GameMsgManager.prototype.forwardTXT = function(text,to) {
	var msg = this.gmg.createTXT(text,to);
	this.forward(msg); 
};

GameMsgManager.prototype.forwardPLIST = function(node,to) {
	var recipient = to || 'ALL';
	var plMsg = this.gmg.sayPLIST(node.pl, recipient);
	this.forward(plMsg);
};

// TODO: check who relied on this
GameMsgManager.prototype.forwardSTATE = function(action,state,to) {
	var recipient = to || 'ALL';
	var stateMsg = this.gmg.createSTATE(action, state, recipient);
	this.forward(stateMsg);
};

GameMsgManager.prototype.forwardDATA = function (action, data, to, text) {
	var recipient = to || 'ALL';
	var dataMsg = this.gmg.createDATA(action, data, recipient, text);
	this.forward(dataMsg);
};

GameMsgManager.prototype.forward = function (gameMsg, to) {

	// Create a copy of the msg and prepare the attributes
	//var gameMsg = new GameMsg(gameMsg);
	//gameMsg.from = this.node.name;
	
	gameMsg.forward = 1;
	
	if (gameMsg.to === 'SERVER' || gameMsg === null || gameMsg.to === undefined) {
		gameMsg.to = 'ALL';
	}	
	
	this.node.partner.gmm.send(gameMsg);

	this.log.msg('F, ' + gameMsg);
	this.log.log('Msg ' + gameMsg.toSMS() + ' forwarded to ' + this.node.partner.name);
};