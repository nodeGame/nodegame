//var EventEmitter = require('./EventEmitter').EventEmitter;
//
//console.log(EventEmitter);
//
//var e = new EventEmitter();

var Ultimatum = require('ultimatum');
//var u = new Ultimatum();




var node2 = require('nodegame-client');


//var node = new nodeGame();

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8004/admin"
};

node2.play(conf, new Ultimatum());