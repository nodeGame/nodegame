module.exports = ServerNode;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var nodemailer = require('nodemailer');

var http = require('http');
var fs = require('fs');
var path = require('path');

var ServerChannel = require('./ServerChannel');

var JSUS = require('nodegame-client').JSUS;

function ServerNode (options, server, io) {
	if (!options) {
		throw new Error('No configuration found to create a server. Aborting');
	}
	this.options = {};
	this.options.mail = ('undefined' !== typeof options.mail) ? options.mail : false;
	this.options.dumpmsg = ('undefined' !== typeof options.dumpmsg) ? options.dumpmsg : false;
	this.options.dumpsys = ('undefined' !== typeof options.dumpsys) ? options.dumpsys : true;
	this.options.verbosity = ('undefined' !== typeof options.verbosity) ? options.verbosity : 1;
	
	this.port = options.port || '80'; // port of the express server and sio
	
	this.maxChannels = options.maxChannels;
	this.channels = [];
	
	this.listen(server, io);
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
		
		else if (filePath === './fabric.js') {
			filePath = './libs/fabric.js/all.min.js';
		}
		
		// Added path.normalize here. TODO: Check if it works on windows.
		var extname = path.extname(path.normalize(filePath));
		
		console.log(filePath);
		
		
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
				console.log('Unexisting path requested.')
				response.writeHead(404);
				response.end();
			}
		});
		
	});
};

ServerNode.prototype.listen = function (http, io) {
	
	this.io = io || require('socket.io');
	this.http = http || this.createHTTPServer();
	
	this.http.listen(this.port);
	this.server = this.io.listen(this.http);
	
	//io.configure('production', function(){
	  this.server.enable('browser client etag');
	  this.server.set('log level', 1);
	//});
}

ServerNode.prototype.addChannel = function (options) {
	if (!options) {
		console.log('Options are not correctly defined for the channel. Aborting');
		return;
	}
	
	var options = JSUS.extend(this.options, options);
	// TODO merge global options with local options
	var channel = new ServerChannel(options, this.server, this.io);
	// TODO return false in case of error in creating the channel
	var ok = channel.listen();
	if (ok) {
		this.channels.push(channel);
		console.log('Channel added correctly: ' + options.name);
	}
	else {
		console.log('Channel could not be added: ' + options.name);
	}
};
