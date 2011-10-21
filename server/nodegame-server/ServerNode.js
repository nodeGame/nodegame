
module.exports = ServerNode;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var nodemailer = require("nodemailer");

var http = require('http');
var fs = require('fs');
var path = require('path');

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

ServerNode.prototype.createHTTPServer = function (options) {
	
	return http.createServer(function (request, response) {

	    // console.log('request starting...');
		
		var filePath = '.' + request.url;
		
		if (filePath === './' || filePath === './log') {
			filePath = './index.htm';
		}
		else if (filePath === './nodegame.js') {
			filePath = './nodegame/nodegame-all-latest.js';
		}
		
		console.log(filePath);
		
		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
		}
		
		path.exists(filePath, function(exists) {
		
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					}
					else {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
				});
			}
			else {
				response.writeHead(404);
				response.end();
			}
		});
		
	});
};

ServerNode.prototype.createServers = function() {
	
	this.http = this.createHTTPServer();
	this.http.listen(this.port);
	this.server = this.io.listen(this.http);
	
	//io.configure('production', function(){
	  this.server.enable('browser client etag');
	  this.server.set('log level', 1);
	//});
		
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