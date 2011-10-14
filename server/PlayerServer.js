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


//TODO: Check it
PlayerServer.prototype.__proto__ = GameServer.prototype;
//PlayerServer.prototype = new GameServer();

//PlayerServer.prototype = new GameServer();
PlayerServer.prototype.constructor = PlayerServer;

function PlayerServer(options) {
	GameServer.call(this,options);
	
//	this.port = options.port;
//	//this.type = options.type || 'PLAYER';
//	this.name = options.name;
//	
//	var dumpmsg = options.dumpmsg || true;
//	
//	this.log = new ServerLog ({name: this.name, "dumpmsg": dumpmsg});
//	
//	this.server = options.server;
//	
//	this.gmm = new GameMsgManager(this);
//	
//	this.pl = new PlayerList();
//	
//	this.partner = null;
}


PlayerServer.prototype.attachListeners = function() {
	
	var that = this;
	var log = this.log;
	
	log.log('Listening for connections');
	
	this.channel = this.server
	  .of(this.channel)
	  .on('connection', function (socket) {
		that.socket = socket;  
		
		var say = GameMsg.actions.SAY + '.';
		var set = GameMsg.actions.SET + '.';
		var get = GameMsg.actions.GET + '.'; 
		
		// TODO: get connid from socket?
		var connStr = "Welcome <" + socket.id + ">";
		log.log(connStr);
		
		// Send HI msg to the newly connected client
		that.gmm.sendHI(connStr,socket.id);
		
		// Tell everybody a new player is connected;
		that.gmm.sendTXT(connStr,'ALL');
		
		socket.on('close', function(){
			that.gmm.sendTXT("<"+socket.id+"> closed");
			log.log("<"+socket.id+"> closed");
			that.gmm.resetMsgQueue(socket.id);
			that.pl.remove(socket.id);
			that.gmm.sendPLIST(that);
			
			// TODO: add checking for not having enough players
		});
		
		
		socket.on('message', function(message){
			
			var msg = that.secureParse(message);
			//that.log.log('JUST RECEIVED P ' + util.inspect(msg));
			
			that.gmm.forward(msg);
			console.log('P About to emit ' + msg.toEvent());
			
			// TODO: improve this
			// Notice: ACK must be fired otherwise the queue does not get cleaned
			if (msg.target === 'ACK' || msg.to !== 'SERVER') {
				console.log(msg.toEvent() + ' ' + msg.to + '-> ' + msg.from);
				//socket.emit(msg.toEvent(),msg);
				that.emit(msg.toEvent(),msg);
			}

		});

        that.on(say+'HI', function(msg) {
        	that.pl.addPlayer(msg.data);
            // TODO: check if this is secure
        	that.gmm.sendPLIST(that); // Send the list of players to all the clients
        	
        	that.log.log('Player is forwarding the PL');
        	// Send PL to monitors
            that.gmm.forwardPLIST(that);
 		});

        that.on(say+'ACK', function(msg) {
//			console.log('PIF? ' + msg.forward);
//			console.log(msg);
//			var id2clear = (msg.forward) ? msg.to : msg.from;		
//			console.log(msg.to + ' ' + msg.from);
			
			that.gmm.clearMsg(msg.from, msg.data);		
		});
		
        that.on(say+'TXT', function(msg) {
			// Personal msg
			// TODO: maybe checked before?
			if (msg.to !== null || msg.to || 'SERVER'){
				that.gmm.sendTXT (msg.text, msg.to);
			}
			// Send it the Monitor anyway
			// Already forwarded
			//that.gmm.forwardTXT(msg.text, msg.to);
		});
				
        that.on(say+'DATA', function(msg) {
			// Personal msg
			// TODO: maybe checked before?
			if (msg.to !== null || msg.to || 'SERVER'){
				that.gmm.sendDATA (msg.data, msg.to, msg.text);
			}
		});
		
        that.on(say+'STATE', function(msg) {
			
			//that.log.log('onSTATE P ' + util.inspect(msg));
			var player = that.pl.get(msg.from);
			if(player){
				player.updateState(msg.data);

				that.gmm.sendPLIST(that);
				
				that.gmm.forwardPLIST(that);
			}
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

//	
//	// Handle WebSocket Requests
//	this.server.addListener("connection", function(conn){
//		var thatServer = this;
//		var say = GameMsg.actions.SAY + '.';
//		var set = GameMsg.actions.SET + '.';
//		var get = GameMsg.actions.GET + '.'; 
//		
//		var connStr = "Welcome <" + conn.id + ">";
//		log.log(connStr);
//		
//		// Send HI msg to the newly connected client
//		that.gmm.sendHI(connStr,conn.id);
//		
//		// Tell everybody a new player is connected;
//		that.gmm.sendTXT(connStr,'ALL');
//		
//		// TODO: Manage automatic start
//		// Can game start?
////		if (that.server.manager.length==that.nPlayers) {
////			that.server.emit('START');	
////		}
//		
//		conn.addListener("close", function(){
//			that.gmm.sendTXT("<"+conn.id+"> closed");
//			log.log("<"+conn.id+"> closed");
//			that.gmm.resetMsgQueue(conn.id);
//			that.pl.remove(conn.id);
//			that.gmm.sendPLIST(that);
//			
//			// TODO: add checking for not having enough players
//		});
//
//		conn.addListener("message", function(message){
//				
//			var msg = that.secureParse(message);
//			//that.log.log('JUST RECEIVED P ' + util.inspect(msg));
//			
//			that.gmm.forward(msg);
//			console.log('P About to emit ' + msg.toEvent());
//			
//			// TODO: improve this
//			// Notice: ACK must be fired otherwise the queue does not get cleaned
//			if (msg.target === 'ACK' || msg.to !== 'SERVER') {
//				console.log(msg.toEvent() + ' ' + msg.to + '-> ' + msg.from);
//				conn.emit(msg.toEvent(),msg);
//			}
//
//		});
//
//        conn.on(say+'HI', function(msg) {
//        	that.pl.addPlayer(msg.data);
//            // TODO: check if this is secure
//        	that.gmm.sendPLIST(that); // Send the list of players to all the clients
//        	
//        	that.log.log('Player is forwarding the PL');
//        	// Send PL to monitors
//            that.gmm.forwardPLIST(that);
// 		});
//
//		conn.on(say+'ACK', function(msg) {
////			console.log('PIF? ' + msg.forward);
////			console.log(msg);
////			var id2clear = (msg.forward) ? msg.to : msg.from;		
////			console.log(msg.to + ' ' + msg.from);
//			
//			that.gmm.clearMsg(msg.from, msg.data);		
//		});
//		
//		conn.on(say+'TXT', function(msg) {
//			// Personal msg
//			// TODO: maybe checked before?
//			if (msg.to !== null || msg.to || 'SERVER'){
//				that.gmm.sendTXT (msg.text, msg.to);
//			}
//			// Send it the Monitor anyway
//			// Already forwarded
//			//that.gmm.forwardTXT(msg.text, msg.to);
//		});
//				
//		conn.on(say+'DATA', function(msg) {
//			// Personal msg
//			// TODO: maybe checked before?
//			if (msg.to !== null || msg.to || 'SERVER'){
//				that.gmm.sendDATA (msg.data, msg.to, msg.text);
//			}
//		});
//		
//		conn.on(say+'STATE', function(msg) {
//			
//			//that.log.log('onSTATE P ' + util.inspect(msg));
//			var player = that.pl.get(msg.from);
//			if(player){
//				player.updateState(msg.data);
//
//				that.gmm.sendPLIST(that);
//				
//				that.gmm.forwardPLIST(that);
//			}
//		});	
//		
//	});
//
//	this.server.addListener("shutdown", function(message) {
//		log.log("Server is shutting down.");
//		that.pl.pl = {};
//		that.gmm.sendPLIST(that);
//		log.close();
//	});
//	
	
//	this.server.on('START', function(sid){
//		
//		that.gmm.forward(that.gmm.gmg.createTXT('**All players connected**'));
//		
//		if (that.autostep) {
//			// 
//			//log('New state:\t' + that.currentState);
//		}
//		
//	});

	
	// Handle HTTP Requests:
//	this.server.addListener("request", function(req, res){
//	  res.writeHead(200, {'Content-Type': 'text/plain'});
//	  res.end('This is, infact a websocket server, but we can do http!\n');
//	});

//};