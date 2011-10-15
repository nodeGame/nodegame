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

// TODO: Check it
AdminServer.prototype.__proto__ = GameServer.prototype;
//AdminServer.prototype = new GameServer();

AdminServer.prototype.constructor = AdminServer;

function AdminServer(options) {
	GameServer.call(this,options);
	
//	this.port = options.port;
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
//	
//	this.partner = null;
	
}

AdminServer.prototype.attachCustomListeners = function() {	
	var that = this;
	var log = this.log;
	var say = GameMsg.actions.SAY + '.';
	var set = GameMsg.actions.SET + '.';
	var get = GameMsg.actions.GET + '.'; 
	
	this.on(say+'HI', function(msg) {
		console.log(that.name + ' ----------------- Got ' + msg.toEvent());
    	// TODO: check this
		//that.pl.addPlayer(msg.data);
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
		
};


//AdminServer.prototype.attachListeners = function() {
//	
//	var that = this;
//	var log = this.log;
//	
//	// LISTENING
//	this.server.addListener("listening", function(){
//		log.log('Listening for connections');
//	});
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
//		//that.gmm.sendTXT(connStr,'ALL');
//		
//		// Send the list of players currently connected to the PlayerServer
//		that.gmm.sendPLIST(that.partner); 
//		
//		
//		conn.addListener("close", function(){
//			// TODO: sending TXT only to admins
//			that.gmm.sendTXT("<"+conn.id+"> closed");
//			log.log("<"+conn.id+"> closed");
//			
//			// TODO: reliable msgs for admins as well
//			that.gmm.resetMsgQueue(conn.id);
//			
//		});
//
//		conn.addListener("message", function(message){
//			
//			var msg = that.secureParse(message);
//			//that.log.log('JUST RECEIVED ' + util.inspect(msg));
//			console.log('A About to emit ' + msg.toEvent());
//			// TODO: improve this
//			if (msg.target === 'ACK' || msg.to !== 'SERVER') {
//				console.log(msg.toEvent() + ' ' + msg.to + '-> ' + msg.from);
//				conn.emit(msg.toEvent(),msg);
//			}
//			
//		});
//	
//		conn.on(say+'HI', function(msg) {
//        	// TODO: check this
//			//that.pl.addPlayer(msg.data);
// 		});
//		
//		conn.on(say+'ACK', function(msg) {
////			console.log('AIF? ' + msg.forward);
////			console.log(msg);
////			var id2clear = (msg.forward) ? msg.to : msg.from;
////			console.log(id2clear + ' ' + msg.from);
//			that.gmm.clearMsg(msg.from, msg.data);
//		});
//		
//		conn.on(say+'TXT', function(msg) {
//			that.gmm.forwardTXT (msg.text, msg.to);
//			that.gmm.sendTXT(msg.from + ' sent MSG to ' + msg.to, 'ALL');
//		});
//
//		conn.on(say+'DATA', function(msg) { 
//			that.gmm.forwardDATA (msg.data, msg.to, msg.text);
//			that.gmm.sendTXT(msg.from + ' sent DATA to ' + msg.to, 'ALL');
//		});
//
//		
//		// SET
//		
//		conn.on(set+'STATE', function(msg){
//			if (!that.checkSync) {
//				that.gmm.sendTXT('**Not possible to change state: some players are not ready**', msg.from);
//			}
//			else {
//				//that.log.log('onSTATE.ADMIN: ' + util.inspect(msg));
//				// Send it to players and other monitors
//				that.gmm.forwardSTATE (GameMsg.actions.SET,msg.data, msg.to);
//				that.gmm.sendSTATE (GameMsg.actions.SET,msg.data, msg.to);
//			}
//		});
//		
//	});
//
//	
//};