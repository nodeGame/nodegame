var node = require('nodegame-client');
module.exports = node;

var Pr = require('peerreview');

var conf = {
	name: "PeerReview_Logic",
	url: "http://localhost:8080/pr/admin"
};



node.play(conf, new Pr());
