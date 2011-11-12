var nodegame = require('nodegame-client');
var Pr = require('peerreview');

var conf = {
	name: "PeerReview_Logic",
	url: "http://localhost:8080/pr/admin"
};



nodegame.play(conf, new Pr());
