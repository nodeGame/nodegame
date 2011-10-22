var Ultimatum = require('ultimatum');

var nodegame = require('nodegame-client');

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8004/admin"
};

nodegame.play(conf, new Ultimatum());
