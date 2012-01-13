var node = require('nodegame-client');
module.exports.node = node;

var Test = require('test');

var conf = {
	name: "Test_Logic",
	url: "http://localhost:8080/pr/admin"
};



node.play(conf, new Test());
