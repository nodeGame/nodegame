function wait () {
	
	this.name = 'Waiting Room - Server';
	this.description = 'Waits until the game starts....';
	this.version = '0.2';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = false;
	
	this.minPlayers = 3;
	this.maxPlayers = 10;
	

	var open = false; // Sends or not players to the game
	
	this.init = function() {
		var open = true;
		var that = this;
		
		this.waiting = new node.PlayerList();
		
		node.on('in.say.PCONNECT', function(msg) {
			if (!msg.data) {
				node.err('Received an empty PCONNECT message. This should not happen.');
				node.err(msg);
				return false;
			}
			var mtid = msg.data.mtid;
			
			var valid = dk.codes.select('AccessCode', '=', mtid).first();
			
			if (!valid) {
				var errUri = '/ultiturk/error.html?id=' + mtid + 'err0=1';
					
				node.redirect(errUri, msg.data.id);
				return;
			}
			else {
				node.say('CHECKEDIN', 'CHECKEDIN', msg.data.id);
			}	
		});
		
		// A new player has completed the test and is ready to play
		node.onDATA('WAITING', function(msg) {
			
			console.log('received msg');
			
			if (!open) { // only one set of players at the moment
				node.say(null, 'FULL', msg.from);
			}
			else {
				
				node.game.waiting.add(msg.data);
				node.say(node.game.waiting.length, 'WAITING', 'ALL');
				
				node.say(node.game.waiting.length, 'CONNECTED', 'ALL');
				
				if (node.game.waiting.length === node.game.minPlayers) {
					open = false; // only one set of players allowed now
					
					// Redirect the players to the game uri
					node.game.waiting.each(function(p){
						var mtid = p.mtid,
							pc = p.pc;
						node.redirect('/ultiturk/index.htm?&id=' + mtid, p.id);
					});
					
					node.game.waiting.clear(true);
				}
			}
		});
		
		
		node.on('in.say.PDISCONNECT', function(msg) {
			node.game.waiting.remove(msg.data.id);
			node.say(node.game.waiting.length, 'CONNECTED', 'ALL');
		});
		
		
	};
	

	this.loop = {
		1: {
			state: function() {
				node.log('Waiting room loaded');	
			},
			name: 'Waiting Room',
		},
	};	
}

//// RUN

var node = require('nodegame-client'),
	NDDB = node.NDDB,
	JSUS = node.JSUS,
	request = require('request'),
	dk = require('descil-mturk');

//dk.getCodes(function(){
//	console.log(dk.codes);
//});

//dk.checkIn('76d0e858baa04c69a0115cf3c3f5c424', function(a,b,c){
//	console.log(c);
//});

var conf = {
	url: "http://localhost:8080/ultimatum/wait/admin",
	io: {
		'reconnect': false,
		'transports': ['xhr-polling'],
		'polling duration': 10
	},
	verbosity: 0,
};
dk.getCodes(function(){
	node.play(conf, new wait());
});





