function Ultimauto () {
	
	this.name = 'Automatic Ultimatum Game';
	this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
	this.version = '0.2';
	
	this.auto_step = false;
	this.auto_wait = true;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;

	this.init = function() {
		this.BIDDER = 1;
		this.RESPONDENT = 0;
		node.window.setup('PLAYER');
	};
	
	
	var pregame = function() {
		node.window.loadFrame('html/pregame.html');
		console.log('Pregame');
	};
	
	var instructions = function(){	
		var that = this;
		
		node.window.loadFrame('html/instructions.html', function() {
	
			var b = node.window.getElementById('read');
		
			b.onclick = function() {
				node.DONE();
			};

			//////////////////////////////////////////////
			// nodeGame hint:
			//
			// Emit an event randomly in a time interval 
			// from 0 to 2000 milliseconds
			//
			//////////////////////////////////////////////
			node.random.emit('DONE',2000);

		});
		

		console.log('Instructions');
	};
		
	var ultimatum = function(){
		var that = this;		
		
		node.window.loadFrame('html/solo.html', function(){
			
			node.onDATA ('BIDDER', function(msg){
				that.other = msg.data.other;
				console.log('OTHER ' + msg.data.other);
				
				node.set('ROLE','BIDDER');
				node.window.loadFrame('html/bidder.html', function() {

					var root = node.window.getElementById('root');
					var b = node.window.getElementById('submitOffer');
					
					//////////////////////////////////////////////
					// nodeGame hint:
					//
					// Execute a function randomly
					// in a time interval between 0 and 1 second
					//
					//////////////////////////////////////////////					
					node.random.exec(function() {
						var offered = Math.floor(1+Math.random()*100);
						node.set('offer', offered);
						node.say(offered, 'OFFER', that.other);
						node.window.write(' Your offer: ' +  offered, root);
					}, 4000);
					
					
					b.onclick = function() {
						var offer = node.window.getElementById('offer');
						// Store the value in memory
						node.set('offer', offer.value);
						node.say('DATA','OFFER', that.other, offer.value);
						node.window.write(root,' Your offer: ' +  offer.value);
					};
						
					node.onDATA ('ACCEPT', function(msg) {
						node.window.write('Your offer was accepted', root);
						node.DONE();
					});
						
					node.onDATA('REJECT', function (msg) {
						node.window.write('Your offer was rejected', root);
						node.DONE();
					});
					
				});
				
			});
			
			node.onDATA('RESPONDENT', function (msg) {
				that.other = msg.data.other;
				console.log('OTHER ' + msg.data.other);
				
				node.set('ROLE','RESPONDENT');
				node.window.loadFrame('html/resp.html', function(){
				
					node.onDATA('OFFER', function(msg) {
						
						var accept = node.window.getElementById('accept');
						var reject = node.window.getElementById('reject');
					
						var offered = node.window.getElementById('offered');
						node.window.write('You received an offer of ' + msg.data, offered);
						offered.style.display = '';
					
						node.random.exec(function(){
							var accepted = Math.round(Math.random());
							
							if (accepted) {
								accept.click();
							}
							else {
								reject.click();
							}
							
						}, 3000);
						
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
			
			});
			
			node.onDATA('SOLO', function() {
				node.DONE();
			});
				
		});
			
	
		console.log('Game');
	};
	
	var postgame = function(){
		node.window.loadFrame('html/postgame.html', function(){
			node.random.emit('DONE', 2000);
		});
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('html/ended.html');
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
}