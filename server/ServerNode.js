
module.exports = ServerNode;

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

function ServerNode (options, io) {
	
	this.io = io || require('socket.io');
	
	this.name = options.name;
	
	if (options.mail) {
		nodemailer.sendmail = true;
		nodemailer.send_mail({sender: this.name, 
	        				  to: options.mail.to,
					          subject: options.mail.subject,
					          body: "MAIL. For now you cannot change this..."}, // TODO allow for custom body
			    function(error, success){
	            console.log("Message "+(success?"sent":"failed"));
	        });
	}
	
	this.nPlayers = options.nPlayers;
	
	this.dump = options.dump; // Should it dump all the msgs?
	
	this.adminChannel = options.admin;
	this.playerChannel = options.player;
	
	this.port = options.port;

	var dumpmsg = options.dumpmsg || true;
		
	this.createServers();
	
}

ServerNode.prototype.createServers = function() {
	
	this.server = this.io.listen(this.port);
		
	this.adminServer = new AdminServer ({
										 io: 		this.io,
										 server: 	this.server,
										 channel: 	this.adminChannel,
										 name: 		'[Admin]'
										});
	
	this.playerServer = new PlayerServer ({
										   io: 		this.io,
										   server: 	this.server,
										   channel: this.playerChannel, 
										   name: 	'[Player]'
										 });
	
	// TODO: probably we do not need this?
	// No we need it for accessing Player Lists... maybe
	this.adminServer.setPartner(this.playerServer);
	this.playerServer.setPartner(this.adminServer);
};

ServerNode.prototype.listen = function() {
	this.adminServer.listen();
	this.playerServer.listen();
};