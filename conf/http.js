module.exports = configure;

var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    express = require('nodegame-server').express,
    J = require('nodegame-client').JSUS;


function configure (app, servernode) {	
	var rootDir = servernode.rootDir;
    return true;
};
