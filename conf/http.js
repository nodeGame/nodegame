/**
 * #  nodeGame ServerNode
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Creates an HTTP server, and loads a Socket.io instance 
 * 
 * ---
 * 
 */

// ## Global scope



module.exports = configure;

var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    express = require('nodegame-server').express,
    J = require('nodegame-client').JSUS;


/**
 * ### ServerNode._configureHTTP
 * 
 * Defines standard routes for the HTTP server
 * 
 * @param {object} options The object containing the custom settings
 */
function configure (app, servernode) {
	
	var rootDir = servernode.rootDir;
	
    return true;
};
