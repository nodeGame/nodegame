
module.exports = ServerChannel;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var nodemailer = require('nodemailer');

var AdminServer = require('./AdminServer');
var PlayerServer = require('./PlayerServer');
var GameServer = require('./GameServer');
var ServerLog = require('./ServerLog');
var GameMsgGenerator = require('./GameMsgGenerator');

var Utils = require('nodegame-client').Utils;
var GameState = require('nodegame-client').GameState;
var GameMsg = require('nodegame-client').GameMsg;

var JSUS = require('nodegame-client').JSUS;
var PlayerList = require('nodegame-client').PlayerList;
var Player = require('nodegame-client').Player;

function ServerChannel (options, server, io) {
	
	this.options = options;
	this.server = server;
	this.io = io;
		
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
	
	
	this.adminChannel = options.admin;
	this.playerChannel = options.player;
	
	this.port = options.port;
		
	this.createServers();
}

ServerChannel.prototype.createServers = function() {
	
	var adminOptions = {
						 	io: 		this.io,
						 	server: 	this.server,
						 	channel: 	this.adminChannel,
						 	parent:		this.name,
						 	user_options: JSUS.extend(this.options, {name: 'A'})
						};
	
	var playerOptions = {
						   io: 		this.io,
						   server: 	this.server,
						   channel: this.playerChannel,
						   parent: 	this.name,
						   user_options: JSUS.extend(this.options, {name: 'P'})
						};
		
	this.adminServer = new AdminServer(adminOptions);
	this.playerServer = new PlayerServer(playerOptions);
	
	this.adminServer.setPartner(this.playerServer);
	this.playerServer.setPartner(this.adminServer);
};

ServerChannel.prototype.listen = function() {
	this.adminServer.listen();
	this.playerServer.listen();
	// TODO: return false when channel cannot be created
	return true;
};
