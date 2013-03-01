//////////////////////////////////////////////
// nodeGame Ultimatum Game 
//
// Extensively documented tutorial for
// nodeGame beginners.
//
// http://www.nodegame.org
//
/////////////////////////////////////////////

function Ultimatum () {
	
	this.name = 'Ultimatum Game';
	this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
	this.version = '0.3';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;

	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The init function is the place to defined
	// global variables, and to setup the game
	// Event listeners defined here are valid 
	// for the whole game.
	//
	/////////////////////////////////////////////
	this.init = function() {
		this.BIDDER = 1;
		this.RESPONDENT = 0;	
		W.setup('PLAYER');
		
		var that = this;
		node.on('BID_DONE', function(offer, to) {
			node.game.timer.stop();
			W.getElementById('submitOffer').disabled = 'disabled';
			node.set('offer', offer);
			node.say(offer, 'OFFER', to);
			W.write(' Your offer: ' +  offer + '. Waiting for the respondent... ');
		});
		
		node.on('RESPONSE_DONE', function(response, offer, from) {
			node.set('response', {
				response: response,
				value: offer,
				from: from
			});
			node.say(response, response, from);
			node.DONE();
		});
		
		this.randomAccept = function(offer, other) {
			var accepted = Math.round(Math.random());
			console.log('randomaccept');
			console.log(offer + ' ' + other);
			if (accepted) {
				node.emit('RESPONSE_DONE', 'ACCEPT', offer, other);
				W.write(' You accepted the offer.');
			}
			else {
				node.emit('RESPONSE_DONE', 'REJECT', offer, other);
				W.write(' You rejected the offer.');
			}
		};
		
		this.isValidBid = function (n) {
			if (!n) return false;
			console.log(n)
			console.log('valid?')
			n = parseInt(n);
			return !isNaN(n) && isFinite(n) && n >= 0 && n <= 100;
		};

	};

	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The first function that is run by nodegame
	// defines what the player will see *before*
	// the game actually starts, i.e. when the 
	// all the players are connected.
	//
	/////////////////////////////////////////////
	var pregame = function() {
		W.loadFrame('html/pregame.html', function(){
			node.DONE();
		});
		console.log('Pregame');
	};
	

	var instructions = function() {	
		var that = this;
		
		//////////////////////////////////////////////
		// nodeGame hint:
		//
		// The W object takes care of all 
		// visual operation of the game. E.g.,
		//
		// W.loadFrame()
		//
		// loads an HTML file into the game screen, 
		// and the execute the callback function 
		// passed as second parameter.
		//
		/////////////////////////////////////////////
		W.loadFrame('html/instructions.html', function() {
			var b = W.getElementById('read');
			b.onclick = function() {
				node.DONE();
			};
			
			
			////////////////////////////////////////////////
			// nodeGame hint:
			//
			// node.env executes a function conditionally to 
			// the environments defined in the configuration 
			// options. 
			//
			// If the 'auto' environment was set to TRUE,
			// then the function will be executed
			//
			////////////////////////////////////////////////
			node.env('auto', function() {
				
				//////////////////////////////////////////////
				// nodeGame hint:
				//
				// Emit an event randomly in a time interval 
				// from 0 to 2000 milliseconds
				//
				//////////////////////////////////////////////
				node.random.emit('DONE',2000);
			});
			
			
		});
		console.log('Instructions');
	};
		
	var ultimatum = function () {
		
		node.game.timer.stop();
		
		//////////////////////////////////////////////
		// nodeGame hint:
		//
		// var that = this;
		//
		// /this/ is usually a reference to node.game
		//
		// However, unlike in many progamming languages,
		// in javascript the object /this/ assumes
		// different values depending on the scope 
		// of the function where it is called.
		//
		/////////////////////////////////////////////
		var that = this;
			
		
		//////////////////////////////////////////////
		// nodeGame hint:
		//
		//	nodeGame offers several types of event
		//  listeners. They are all resemble the syntax
		//
		//  node.on<[DATA,TXT,PLIST, etc]>
		//
		//  The low level event listener is simply 
		//
		//  node.on
		//
		/////////////////////////////////////////////
		node.onDATA('BIDDER', function (msg) {
			
			var other = msg.data.other;
			
			node.set('ROLE', 'BIDDER');
			W.loadFrame('html/bidder.html', function () {
				
				// Start the timer after an offer was received.
				var options = {
						milliseconds: 30000,
						timeup: function(){
							node.emit('BID_DONE', Math.floor(1+Math.random()*100), other);
						}
				};
				
				node.game.timer.restart(options);

				var b = W.getElementById('submitOffer');
				
				node.env('auto', function() {
					
					//////////////////////////////////////////////
					// nodeGame hint:
					//
					// Execute a function randomly
					// in a time interval between 0 and 1 second
					//
					//////////////////////////////////////////////
					node.random.exec(function() {
						node.emit('BID_DONE', Math.floor(1+Math.random()*100), other);
					}, 4000);
				});
				
				b.onclick = function() {
					var offer = W.getElementById('offer');
					if (!that.isValidBid(offer.value)) {
						W.writeln('Please enter a number between 0 and 100');
						return;
					}
					node.emit('BID_DONE', offer.value, other);
				};
				
				node.onDATA('ACCEPT', function (msg) {
					W.write(' Your offer was accepted.');
					node.random.emit('DONE', 3000);
				});
					
				node.onDATA('REJECT', function (msg) {
					W.write(' Your offer was rejected.');
					node.random.emit('DONE', 3000);
				});
			});
		});
			
		node.onDATA('RESPONDENT', function (msg) {
			var other = msg.data.other;
			node.set('ROLE', 'RESPONDENT');
			
			var options = {
					milliseconds: 30000,
					timeup: function() {
						that.randomAccept(msg.data, other);
					}
			};
			node.game.timer.init(options);
			// set to 30:00
			node.game.timer.updateDisplay();
			
			W.loadFrame('html/resp.html', function () {
				
				node.onDATA('OFFER', function (msg) {
										
					// Start the timer after an offer was received.
					node.game.timer.start();
					
					var offered = W.getElementById('offered');
					W.write('You received an offer of ' + msg.data, offered);
					offered.style.display = '';
				
					var accept = W.getElementById('accept');
					var reject = W.getElementById('reject');
				
					node.env('auto', function() {
						node.random.exec(function() {
							that.randomAccept(msg.data, other);
						}, 3000);
					});
					
					accept.onclick = function() {
						node.emit('RESPONSE_DONE', 'ACCEPT', msg.data, other);
					};
					
					reject.onclick = function() {
						node.emit('RESPONSE_DONE', 'REJECT', msg.data, other);
					};
				});
			});	
		});
			
		node.onDATA('SOLO', function() {
			W.loadFrame('html/solo.html', function () {
				var options = {
						milliseconds: 0,
						timeup: function() {
							that.randomAccept(msg.data, other);
						}
				};
				node.game.timer.init(options);
				// set to 30:00
				node.game.timer.updateDisplay();
				
				//////////////////////////////////////////////
				// nodeGame hint:
				//
				// node.DONE() communicates to the server that 
				// the player has completed the current state.
				//
				// What happens next depends on the game. 
				// In this game the player will have to wait
				// until all the other players are also "done".
				// 
				/////////////////////////////////////////////
				node.DONE();
			});

			console.log('solodone');
			
		});	

		console.log('Ultimatum');
	};
	
	var postgame = function(){
		W.loadFrame('html/postgame.html', function(){
			node.env('auto', function(){
				node.random.emit('DONE');
			});
		});
		console.log('Postgame');
	};
	
	var endgame = function(){
		W.loadFrame('html/ended.html', function(){
			node.on('WIN', function(msg) {
				W.write('Your earning in the game is: ' + msg.data);
			});
		});
		
		console.log('Game ended');
	};
	
	// Creating the game loop
	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The /loops/ object defines the all the 
	// states of the game, and the order in which
	// they will be called.
	// 
	// Every state is an object that, in its
	// simplest form, contains only a function.
	// However, it can also contained nested 
	// functions and other information, such as
	// the maximum amount of time each player
	// has to complete the state.
	//
	/////////////////////////////////////////////
	this.loop = {
		1: {state: pregame,
			name: 'Game will start soon'
		},
		
		2: {state: instructions,
			name: 'Instructions',
			timer: 120000
		},
		
		3: {rounds: 3, 
			state:  ultimatum,
			name: 'Ultimatum Game'
		}, 
		
		4: {state: postgame,
			name: 'Questionnaire',
			timer: 120000,
			done: function(){
				var ta = W.getElementById('comment');
				node.set('comment', ta.value);
				return true;
			}
		},
		
		5: {state: endgame,
			name: 'Thank you!'
		}
	};	
}


module.exports = Ultimatum;
