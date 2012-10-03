function Ultimatum_wait () {
	
	this.name = 'Waiting Room Ultimatum Game - Client';
	this.description = 'Waits until the game starts....';
	this.version = '0.1';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = false;

//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	var NUMPLAYERS = 3;
	var open = true; // Sends or not players to the game
	
	this.init = function() {
		var open = true;
		node.on('UPDATED_PLIST', function(){
			console.log('Player list = ' + node.game.pl.length);
			
			if (!open) {
				var exitcode;
				node.game.pl.each(function(p){
					if (!p.checkout && !p.playing) {
						p.checkout = true;
						exitcode = dk.codes.select('AccessCode', '=', p.mtid).first().ExitCode;
						dk.checkOut(p.mtid, exitcode, 0);
					}
					if (!p.playing) {
						node.say(null, 'FULL', p.id);
					}
					
				});
			}
			else if (node.game.pl.length === NUMPLAYERS) {
				open = false; // only one set of players allowed now
				
				// We need to mark all selected players first
				// otherwise the first that is redirected will
				// trigger the UPDATED_PLIST event
				node.game.pl.each(function(p){
					p.playing = true;
				});
				node.game.pl.each(function(p){
					var mtid = p.mtid;
					node.redirect('/ultimatum/index.html?id=' + mtid, p.id);
				});
				
			}
		});
		
	};
		
	var waiting = function() {
		
		node.log('Waiting room loaded');
	};
	

	this.loops = {
		1: {state: waiting,
			name: 'Waiting Room'
		},
	};	
}

//// RUN

var node = require('nodegame-client'),
	NDDB = node.NDDB,
	JSUS = node.JSUS,
	request = require('request'),
	dk = require('descil-mturk');
	


/// Start the game only after we have received the list of access codes
dk.getCodes(function(){
	var conf = {
		name: "waiter",
		url: "http://localhost:8080/ultimatum/wait/admin",
		io: {
			'reconnect': false,
			'transports': ['xhr-polling'],
			'polling duration': 10
		},
		verbosity: 0,
    };

    node.play(conf, new Ultimatum_wait());
});




