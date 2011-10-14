module.exports = GameMsgManager;

var util = require('util');

//SOCKET.IO
var io = require('socket.io');

// TODO: Does Socket.io provides reliable sending? 
// Reliable is disable for now.


var GameState = require('./GameState');
var GameMsg = require('./GameMsg');
var GameMsgGenerator = require('./GameMsgGenerator');

function GameMsgManager(node) {
	
	this.name = node.name || 'GenericSender';
	this.session = Math.floor(Math.random()*10000);
	this.currentState =  node.currentState || new GameState(); // TODO: Check what is best to init
	this.timeout = 10000; // 10 Seconds	
	
	this.msgQueue = {};
	
	this.node = node;
	this.log = node.log;
	this.server = node.server;
	this.socket = node.socket;
	
	//TODO: find a way to access node.server when it is ready
	//this.server = this.node.server;
	
	this.gmg = new GameMsgGenerator(this.session,this.name,this.currentState);	// TODO: Check what is best to init
	this.types = this.gmg.types;
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
	var plMsg = this.gmg.createPLIST(GameMsg.actions.SET, node.pl, recipient);
	this.send(plMsg);
};

GameMsgManager.prototype.sendSTATE = function(action,state,to) {
	var recipient = to || 'ALL';
	// TODO: set/get/say choose carefully
	var stateMsg = this.gmg.createSTATE(action, state, recipient);
	this.sendReliable(stateMsg);
};

GameMsgManager.prototype.sendDATA = function (data,to,text) {
	var recipient = to || 'ALL';
	var dataMsg = this.gmg.createDATA(data, recipient,text);
	this.sendReliable(dataMsg); 
};

GameMsgManager.prototype.send = function(gameMsg) {
		
	if (gameMsg.to === 'SERVER' ||  gameMsg.to === null) {
		console.log('Trying to send msg to nobody.')
		return false;
	}
	
	if (gameMsg.to === 'ALL') {
		
		this.node.channel.json.send(gameMsg.stringify());
		
		// WORKING
		//this.node.channel.send(gameMsg.stringify());
		
		
		
		//this.node.socket.broadcast.send(gameMsg.stringify());
		//this.node.socket.send(gameMsg.stringify());
		//this.server.sockets.json.send(gameMsg);
		//this.server.sockets.json.send(gameMsg);
		//this.node.server.broadcast.emit(gameMsg.stringify());
		this.log.msg('B, ' + gameMsg);
	}
	else {
		
		// This should send to the specific client
		this.node.channel.sockets[gameMsg.to].json.send(gameMsg.stringify());
		
		// WORKING
		//this.node.socket.send(gameMsg.stringify());
		
		//this.node.server.sockets.send(gameMsg.stringify());
		//this.server.sockets.sockets[gameMsg.to].json.send(gameMsg);
		//this.node.server.emit(gameMsg.to, gameMsg.stringify());
		this.log.msg('S, ' + gameMsg);
	}
};

GameMsgManager.prototype.sendReliable = function(gameMsg) {
	
	
	this.send(gameMsg);
	
	// WHAT FOLLOWS IS DISABLE FOR NOW
	
	if (gameMsg.to === 'SERVER' ||  gameMsg.to === null) {
		return false;
	}

	//this.log.log('Sending Reliably ' +  util.inspect(gameMsg));
	
	gameMsg.reliable = 1;
	
	// Breaks down the recipients
	if (gameMsg.to === 'ALL') {
		this.broadcastReliable(gameMsg);
	}
	else { 
		// Send one msg immediately and then resend it in case of missing ACK
		this.send(gameMsg);	
		this.add2Queue(gameMsg);	
	}
};

GameMsgManager.prototype.broadcastReliable = function(gameMsg) {
	
	this.send(gameMsg);
	
	// WHAT FOLLOWS IS DISABLE FOR NOW
	
	var that = this;
	var allCons = this.node.getConnections(this.node.server);
	var i;
	//this.log.msg('B: ' + gameMsg);
	for (i=0; i< allCons.length;i++) {
		var player = allCons[i];
		gameMsg.to = player; 
		this.sendReliable(gameMsg);
	}
	this.log.log('B, ' + gameMsg.id + ': ' + 'executed correctly.');
	
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
	this.forwardReliable(stateMsg);
};

GameMsgManager.prototype.forwardDATA = function (data,to,text) {
	var recipient = to || 'ALL';
	var dataMsg = this.gmg.createDATA(data, recipient,text);
	this.forwardReliable(dataMsg); 
};

GameMsgManager.prototype.forward = function (gameMsg, to) {

	// TODO: how the get the number of connected clients?
	
//	console.log('PARTNER ' + this.node.partner.socket.sockets.sockets);// + this.node.partner.server.clients());
//	
//	for (var i in this.node.partner.server.sockets.manager) {
//		if (this.node.partner.server.sockets.manager.hasOwnProperty(i)){
//			console.log(i + this.node.partner.server.sockets.manager[i]);
//		}
//	}
//	
	
	//console.log(io.of('/admin').clients());
	//console.log(this.node.partner.server.clients());
	
	// If somebody is connected to the other server
	//if (this.node.partner.server.manager.length > 0){
		
		// Create a copy of the msg;
		var gameMsg = GameMsg.parse(gameMsg);
		//gameMsg.from = this.node.partner.name;
		gameMsg.from = this.node.name;
		if (gameMsg.to === 'SERVER' || gameMsg === null || gameMsg.to === undefined) {
			gameMsg.to = 'ALL';
		}
		gameMsg.forward = 1;
		
		if (gameMsg.reliable) {
			this.node.partner.gmm.sendReliable(gameMsg);
		}
		else {
			this.node.partner.gmm.send(gameMsg);
		}
		
		this.log.msg('F, ' + gameMsg);
		this.log.log('Msg ' + gameMsg.toSMS() + ' forwarded to ' + this.node.partner.name);
//	}
//	else{
//		var noListeners = 'Nobody to forward the msg to in ' + this.node.partner.name;
//		//this.sendTXT(noListeners);
//		this.log.log(noListeners);
//		// Inform that there are no listeners
//		this.sendTXT(noListeners, 'ALL');
//	}
};

GameMsgManager.prototype.forwardReliable = function(gameMsg) {
	
	this.forward(gameMsg);
	// WHAT FOLLOWS IS DISABLE FOR NOW
	
	gameMsg.reliable = 1;	
	this.forward(gameMsg);	
};


//Clear Msg from Queue
GameMsgManager.prototype.add2Queue = function (gameMsg) {	
	
	var that = this;
	var id2store = (gameMsg.forward) ? gameMsg.to : gameMsg.from;
	var id2store = gameMsg.to;
	
	//this.log.log(util.inspect(gameMsg));
	//this.log.log('Added to clear: ' + id2store);
	
	if (!this.msgQueue.hasOwnProperty(id2store)) {
		this.msgQueue[id2store] = {};
	}
	
	this.msgQueue[id2store][gameMsg.id] = setInterval( function() {
		that.send(gameMsg);	
	},this.timeout);
	
	//this.log.log(util.inspect(this.msgQueue));
	
};


//Clear Msg from Queue
GameMsgManager.prototype.clearMsg = function (connid, msgid) {	
	if (this.msgQueue[connid]) {
		if (this.msgQueue[connid][msgid]) {
			clearInterval(this.msgQueue[connid][msgid]);
			delete this.msgQueue[connid][msgid];	
		}
		else {
			this.log.log('Attempt to clear unexisting reliable msg: ' + connid + '.' + msgid, 'ERR');
			console.log(util.inspect(this.msgQueue));
		}
	}
	else {
		this.log.log('Attempt to access unexisting player in the Msg Queue: ' + connid, 'ERR');
		//console.log(util.inspect(this.msgQueue));
	}
};

//Reset the Queue of messages with reliable support
GameMsgManager.prototype.resetMsgQueue = function (connid) {
		
	if (this.msgQueue[connid]) {
		for (var key in this.msgQueue) {
		    if (this.msgQueue[connid].hasOwnProperty(key)) {
		    	this.log.log('Msg ' + key + ' could not be delivered to ' + connid, 'ERR');
		    	clearInterval(this.msgQueue[connid][key]);
		    	delete this.msgQueue[connid];
		    }
		}
		delete this.msgQueue[connid];
		this.log.log('Cleaned the queue ' + connid );
	}
	else {
		this.log.log('Attempt to reset unexisting player in the Msg Queue: ' + connid, 'ERR');
	}
	
	
};