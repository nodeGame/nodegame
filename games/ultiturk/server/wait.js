function wait () {
	
	this.name = 'Waiting Room - Server';
	this.description = 'Waits until the game starts....';
	this.version = '0.3';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = false;
	
	this.minPlayers = 3;
	this.maxPlayers = 10;
	

	var open = true; // Sends or not players to the game
	
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
			
			var valid = dk.codes.id[mtid];
			
			//var valid = dk.codes.select('AccessCode', '=', mtid).first();
			
			var errUri;
			
			if (!valid) {
				errUri = '/ultiturk/error.html?id=' + mtid + '&err0=1';	
				node.redirect(errUri, msg.data.id);
				return;
			}
			else if (dk.codeUsage(mtid)) {
				console.log('Code ' +  mtid + ' already in use ' + dk.codeUsage(mtid) + ' times');
				errUri = '/ultiturk/error.html?id=' + mtid + '&codeInUse=1';
				node.redirect(errUri, msg.data.id);
				dk.decrementUsage(mtid);
			}
			else {
				// PLAYER IS AUTHORIZED
				dk.incrementUsage(mtid);
				dk.checkIn(mtid);
				node.say('CHECKEDIN', 'CHECKEDIN', msg.data.id);	
			}	
		});
		
		node.on('in.say.PDISCONNECT', function(msg) {
			if (!msg.data) {
				node.err('Received an empty PCONNECT message. This should not happen.');
				node.err(msg);
				return false;
			}
			
			node.game.waiting.remove(msg.data.id);
			node.say(node.game.waiting.length, 'CONNECTED', 'ALL');
			
			var mtid = msg.data.mtid;
		
			dk.decrementUsage(mtid);
			console.log('Code ' +  mtid + ' in use ' + dk.codeUsage(mtid) + ' times');
		});
		
		// A new player has completed the test and is ready to play
		node.onDATA('WAITING', function(msg) {
			
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
						var mtid = p.mtid;
						node.redirect('/ultiturk/index.html?&id=' + mtid, p.id);
					});
					
					node.game.waiting.clear(true);
				}
			}
		});
		
		
		// user was redirected to the error page
		node.onDATA('errors', function(msg) {
			if (!msg.data || !msg.data.player) {
				console.log('Empty errors msg received...should not happen!');
				return;
			}
			dk.dropOut(msg.data.player.accessCode);
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





