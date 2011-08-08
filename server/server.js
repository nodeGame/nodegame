

var ServerNode = require('./ServerNode');

//var ws = require("websocket-server");
//var util = require('util');
//var EventEmitter = require('events').EventEmitter;

//var Utils = require('./Utils');
//var ServerLog = require('./ServerLog');
//var GameState = require('./GameState');
//var GameMsg = require('./GameMsg');
//var GameMsgGenerator = require('./GameMsgGenerator');
//var PlayerList = require('./PlayerList').PlayerList;
//var Player = require('./PlayerList').Player;

function GameSocketServer(options) {
	// TODO: add Log
	// TODO: add Time Scheduler
	this.servers = new Array();
};


GameSocketServer.prototype.createServer = function(options) {
	// TODO: check default options
	var sn = new ServerNode(options);
	sn.listen();
	this.servers.push(sn);
	
	return true;
};
	
	

// Instatiate the Server

var options = { 
				nPlayers: 4,
				adminPort: 8004,
				playerPort: 8005,
				dump: true
			  };

var gss = new GameSocketServer();

gss.createServer(options);