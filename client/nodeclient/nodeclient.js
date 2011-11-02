var nodegame = require('nodegame-client');
var Ultimatum = require('ultimatum');

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8004/ultimatum/admin"
};



nodegame.play(conf, new Ultimatum());
