function Ultimatum () {
	
	this.name = 'Ultimatum Game';
	this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
	this.version = '0.3';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.BIDDER = 1;
	this.RESPONDENT = 0;
	
	this.init = function() {	
		node.window.setup('PLAYER');
	};
	
	
	var pregame = function() {
		node.window.loadFrame('pregame.html');
		node.DONE();
		console.log('Pregame');
	};
	
	var instructions = function(){	
		var that = this;
		
		node.window.loadFrame('instructions.html', function() {
			var b = node.window.getElementById('read');
			b.onclick = function() {
				node.DONE();
			};
		});
		console.log('Instructions');
	};
		
	var ultimatum = function () {
		var that = this;		
		node.window.loadFrame('solo.html', function () {
			
			
			node.on('BIDDER', function (msg) {
				
				node.set('ROLE','BIDDER');
				node.window.loadFrame('bidder.html', function () {

					var root = node.window.getElementById('root');
					var b = node.window.getElementById('submitOffer');
					
					b.onclick = function() {
						var offer = node.window.getElementById('offer');
						// Store the value in memory
						node.set('offer', offer.value);
						node.say('DATA','OFFER', that.other,offer.value);
						node.window.write(root,' Your offer: ' +  offer.value);
					};
					
					node.on('ACCEPT', function (msg) {
							node.window.write(root, 'Your offer was accepted');
							node.DONE();
					});
						
					node.on('REJECT', function (msg) {
						node.window.write(root, 'Your offer was rejected');
						node.DONE();
					});
				});
			});
				
			node.on('RESPONDENT', function (msg) {
				
				node.set('ROLE','RESPONDENT');
				node.window.loadFrame('resp.html', function(){
				
				node.on('OFFER', function (msg) {			
					var offered = node.window.getElementById('offered');
					node.window.write(offered, 'You received an offer of ' + msg.text);
					offered.style.display = '';
				
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
			});
				
				
			node.on('OTHER', function (msg) {
				that.other = msg.text;
			});
			
			node.on('SOLO', function() {
				console.log('solodone');
				node.DONE();
			});
				
		});
	
			console.log('Ultimatum');
		});
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
	
	// Creating the game loop
	
	this.loops = {
		1: {state: pregame,
			name: 'Game will start soon'
		},
		
		2: {state: instructions,
			name: 'Instructions'
		},
		
		3: {rounds: 10, 
			state:  ultimatum,
			name: 'Ultimatum Game'
		}, 
		
		4: {state: postgame,
			name: 'Questionnaire'
		},
		
		5: {state: endgame,
			name: 'Thank you!'
		}
	};	
};
