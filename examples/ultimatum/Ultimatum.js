function Ultimatum () {
	
	this.name = 'Ultimatum Game';
	this.description = 'Ultimatum Descr';
	this.version = '0.2';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.BIDDER = 1;
	this.RESPONDENT = 0;
	
	this.init = function() {	
		node.window.setup('PLAYER');
		//node.random.emit('DONE');
	};
	
	
	var pregame = function() {
		node.window.loadFrame('pregame.html');
		console.log('Pregame');
	};
	
	var instructions = function(){	
		var that = this;
		
		node.window.loadFrame('instructions.html', function() {
	
			var b = node.window.getElementById('read');
		
			b.onclick = function() {
				node.DONE('Done for now...');
				node.emit('WAIT');
			};
		});
		
		
		console.log('Instructions');
	};
		
	var ultimatum = function(){
		var that = this;		
		node.window.loadFrame('solo.html', function(){
			
			node.onDATA (function(msg){
						
				if (msg.data === 'BIDDER') {
					
					node.set('ROLE','BIDDER');
					
					node.window.loadFrame('bidder.html', function() {
	
						var root = node.window.getElementById('root');
						var b = node.window.getElementById('submitOffer');
						
						b.onclick = function() {
							var offer = node.window.getElementById('offer');
							// Store the value in memory
							node.set('offer', offer.value);
							node.say('DATA','OFFER', that.other,offer.value);
							node.window.write(root,' Your offer: ' +  offer.value);
						};
							
						node.onDATA (function(msg) {
							
							if (msg.data === 'ACCEPT') {
								node.window.write(root, 'Your offer was accepted');
								node.DONE();
							}
							
							if (msg.data === 'REJECT') {
								node.window.write(root, 'Your offer was rejected');
								node.DONE();
							}
						});
						
					});
					
				}
				else if (msg.data === 'RESPONDENT') {
					
					node.set('ROLE','RESPONDENT');
					
					node.window.loadFrame('resp.html', function(){
					
						node.onDATA( function(msg) {
							
							if (msg.data === 'OFFER') {			
								var offered = node.window.getElementById('offered');
								node.window.write(offered, 'You received an offer of ' + msg.text);
								offered.style.display = '';
							}
							
						});
						
						
						var accept = node.window.getElementById('accept');
						var reject = node.window.getElementById('reject');
						
						
						accept.onclick = function() {
							node.set('response','ACCEPT');
							node.say('DATA', 'ACCEPT', that.other);
							node.DONE();
						};
						
						reject.onclick = function() {
							node.set('response','REJECT');
							node.say('DATA', 'REJECT', that.other);
							node.DONE();
						};
						
					});
				
				}
				
				else if (msg.data === 'OTHER') {
					that.other = msg.text;
				}
				
				else if (msg.data === 'SOLO') {
					console.log('solodone');
					node.DONE();
				}
				
				else {
					console.log(msg.data);
				}
			});
		});
			
	
		console.log('Game1');
	};
	
	var postgame = function(){
		node.window.loadFrame('postgame.html', function(){
			node.random.emit('DONE');
		});
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	// Assigning Functions to Loops
	
	var pregameloop = {
		1: pregame
	};
	
	var instructionsloop = {
		1: instructions
	};
	
	var gameloop = { // The different, subsequent phases in each round
		1: ultimatum
	};
	
	var postgameloop = {
		1: postgame
	};
	
	var endgameloop = {
		1: endgame
	};
	
	
	// LOOPS
	this.loops = {
			1: {loop:pregameloop},
			2: {loop:instructionsloop},
			3: {rounds:10, loop:gameloop}, // rounds is governed by the server, if not automatic_step is set
			4: {loop:postgameloop},
			5: {loop:endgameloop}
		};	
}
