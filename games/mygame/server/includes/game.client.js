/**
 * This file contains all the building blocks (functions, and configuration) that will be send to the client
 */

var game = {};

module.exports = game;

game.globals = {
	BIDDER: 1,
	RESPONDENT: 0,
	randomAccept: function(offer, other) {
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
	},
	
	isValidBid: function (n) {
		if (!n) return false;
		console.log(n)
		console.log('valid?')
		n = parseInt(n);
		return !isNaN(n) && isFinite(n) && n >= 0 && n <= 100;
	}
};

game.init = function() {
		
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

};

game.gameover = function() {};


game.pregame = function() {
	W.loadFrame('html/pregame.html', function(){
		node.DONE();
	});
	console.log('Pregame');
};


game.instructions = function() {	
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
	
game.bidder = function () {

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

};		

game.respondent = function() {
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

	console.log('Ultimatum');
};

game.solowait = function() {
	
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
		
};

game.postgame = function() {
	W.loadFrame('html/postgame.html', function(){
		node.env('auto', function(){
			node.random.emit('DONE');
		});
	});
	console.log('Postgame');
};

game.endgame = function() {
	W.loadFrame('html/ended.html', function(){
		node.on('WIN', function(msg) {
			W.write('Your earning in the game is: ' + msg.data);
		});
	});
	
	console.log('Game ended');
};


game.steps = [
              { id: 'instructions', 
            	cb: instructions },
              { id: 'quiz', 
            	cb: quiz }
];

game.stages = [
	{
		id: 'tutorial',
	 	steps: [ 'instructions', 'quiz'], // step ids in sequential order 
		onstepdone: 'GOTONEXT' // executes the next step of the stage automatically after a successfull DONE, 
	},
    { 	id: 'bidder', 
		cb: bidder },
    {	id: 'respondent', 
    	cb: respondent },
    {	id: 'solowait',
    	cb: solowait },
    {	id: 'questionnaire', 
    	cb: questionnaire }
];

