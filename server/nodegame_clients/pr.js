var node = require('../node_modules/nodegame-server/node_modules/nodegame-client');
module.exports.node = node;

var Pr = require('peerreview');

var conf = {
	name: "PeerReview_Logic",
	url: "http://localhost:8080/pr/admin",
	io: {				 
	     reconnect: false
	} 
};



node.play(conf, new Pr());
