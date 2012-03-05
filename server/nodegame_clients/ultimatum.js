var nodegame = require('../node_modules/nodegame-server/node_modules/nodegame-client');
module.exports.nodegame = nodegame;

var Ultimatum = require('ultimatum');

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum/admin"
};

nodegame.play(conf, new Ultimatum());