
module.exports = ServerNode;

var ws = require("websocket-server");
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var nodemailer = require("nodemailer");

var AdminServer = require('./AdminServer');
var PlayerServer = require('./PlayerServer');
var GameServer = require('./GameServer');

var Utils = require('./Utils');
var ServerLog = require('./ServerLog');
var GameState = require('./GameState');
var GameMsg = require('./GameMsg');
var GameMsgGenerator = require('./GameMsgGenerator');
var PlayerList = require('./PlayerList').PlayerList;
var Player = require('./PlayerList').Player;

function ServerNode (options) {
	
//	nodemailer.sendmail = true;
//	
//	nodemailer.send_mail({sender: "Server Cool", 
//        to:"futur.dorko@gmail.com",
//        subject:"Test mail ste",
//        body:"Cool, it works"},
//        function(error, success){
//            console.log("Message "+(success?"sent":"failed"));
//        });
	
	this.nPlayers = options.nPlayers;
	
	this.dump = options.dump; // Should it dump all the msgs?
	
	this.adminPort = options.adminPort;
	this.playerPort = options.playerPort;
	
	
	this.port = options.port;
	this.type = options.type || 'PLAYER';
	this.name = options.name;
	
	var dumpmsg = options.dumpmsg || true;
	
	this.createServers();
	
}

ServerNode.prototype.createServers = function() {
	this.adminServer = new AdminServer ({port: this.adminPort, name: '[Admin]'});
	this.playerServer = new PlayerServer ({port: this.playerPort, name: '[Player]'});

	
	this.adminServer.setPartner(this.playerServer);
	this.playerServer.setPartner(this.adminServer);
};

ServerNode.prototype.listen = function() {
	this.adminServer.listen();
	this.playerServer.listen();
};


////Instatiate a single ServerNode
//
//var options = { 
//				nPlayers: 4,
//				adminPort: 8000,
//				playerPort: 8001,
//				dump: true
//			  };
//
//var sn = new ServerNode(options);
//sn.listen();