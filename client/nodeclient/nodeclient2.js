var nodegame = require('nodegame-client');
var Ultimatum2 = require('ultimatum2');
var Ultimatum3 = require('ultimatum3');
var Ultimatum4 = require('ultimatum4');

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum2/admin",
	dump: "dump.csv"
};



nodegame.play(conf, new Ultimatum2());


//var conf = {
//		name: "P_" + Math.floor(Math.random()*100),
//		url: "http://localhost:8080/ultimatum3/admin"
//	};
//
//
//
//nodegame.play(conf, new Ultimatum3());
//	
//	
//var conf = {
//		name: "P_" + Math.floor(Math.random()*100),
//		url: "http://localhost:8080/ultimatum4/admin"
//	};
//
//
//
//nodegame.play(conf, new Ultimatum4());
