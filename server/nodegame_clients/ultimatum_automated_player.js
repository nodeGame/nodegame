var nodegame = require('../node_modules/nodegame-server/node_modules/nodegame-client');
module.exports.nodegame = nodegame;

// var node = module.parent.exports.nodegame;
var node = nodegame;
var JSUS = node.JSUS;

var Fake_Ultimatum_Player = function() {
	
	this.name = 'Ultimatum Game';
	this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
	this.version = '0.3';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;
	
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.BIDDER = 1;
	this.RESPONDENT = 0;
	
	this.init = function() {	        
        // console.log('client init');
	};
	
	var pregame = function() {
		

		console.log(node.node._listeners.count());
		
//		node.onDATA('CULO', function(msg) {
//			//
//		});
		
//		console.log(node.node._listeners.select('state', '=', node.state()).count());
		
		console.log(node.node._listeners.D.state.toString());
		
		
//		console.log(node.node._listeners.count());
//		console.log(node.node._listeners.fetchValues());
//		
//		
//		node.node.clearLocalListeners();
//		console.log(node.node._listeners.count());
//		
//		
//		
//		node.node.removeListener('in.say.DATA');
//		console.log(node.node._listeners.count());
//		
//		console.log(node.node._listeners.select('event', '=', 'in.say.DATA').count());
//		
//		console.log(node.node._listeners.select('state', '=', node.state()).count());
//		
//		var gg = node.node._listeners.groupBy('state');
		//console.log(gg);
		
		
//		for (var i in gg) {
//			console.log(gg[i]);
//		}
		
		//console.log(node.node._listeners.fetch());
		
        //node.DONE();
		console.log('Pregame');
	};
	
	var instructions = function(){	
		node.DONE();	        
		console.log('Instructions');
	};
		
	var ultimatum = function () {
		
		var that = this;
		
		node.onDATA('BIDDER', function(msg){
		    that.other = msg.data.other;
		    console.log('OTHER ' + msg.data.other);
		    
		    node.set('ROLE', 'BIDDER');
		    
		    node.random.exec(function() {
				var offered = Math.floor(1+Math.random()*100);
				node.set('offer', offered);
				node.say('DATA','OFFER', that.other,offered);
			}, 10000);
		    
		    node.onDATA('ACCEPT', function(msg){
		        console.log('Your offer was accepted');
		        node.random.emit('DONE', 10000);
		    });
		    
		    node.onDATA('REJECT', function(msg){
		        console.log('Your offer was rejected');
		        node.random.emit('DONE', 10000);
		    });
		    
		});
		
		node.onDATA('RESPONDENT', function(msg){
		    that.other = msg.data.other;
		    node.set('ROLE', 'RESPONDENT');
		    
		    node.onDATA('OFFER', function(msg) {
		    	
		    	var accept = Math.round(Math.random());                
                
                if (accept) {
                    node.set('response', 'ACCEPT');
                    node.say('ACCEPT', 'ACCEPT', that.other);
                    node.random.emit('DONE', 10000);
                } else {
                    node.set('response', 'REJECT');
                    node.say('REJECT', 'REJECT', that.other);
                    node.random.emit('DONE', 10000);
                }
		    });
		});
		
		node.onDATA('SOLO', function () {
            console.log('solodone');
            node.random.emit('DONE', 10000);
        });
	
		console.log('Ultimatum');
	};
	
	var postgame = function () {
	    node.random.emit('DONE', 10000);
		console.log('Postgame');
	};
	
	var endgame = function () {
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

var conf = {
    name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum"
    //verbosity: 10
};

nodegame.play(conf, new Fake_Ultimatum_Player());
