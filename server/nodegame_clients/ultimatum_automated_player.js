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
	    /* Adds widgets to the page. -------- */
        // node.window.setup('PLAYER');
        
        console.log('client init');
	};
	
	
	var pregame = function() {
	    /* Will load the new remote frame and update the internal status accordingly ---------- */
        // node.window.loadFrame('pregame.html');
        
        /* Emits a DONE message ------------ */
        node.DONE();
        
		console.log('Pregame');
	};
	
	var instructions = function(){	
		var that = this;
		
		/* Emits a DONE message ------------ */
		node.DONE();
		
        // node.window.loadFrame('instructions.html', function() {
        //  var b = node.window.getElementById('read');
        //  b.onclick = function() {
        //      node.DONE();
        //  };
        //  
        //  // Autoplay
        //  node.DONE();
        // });
        
		console.log('Instructions');
	};
		
	var ultimatum = function () {
		
		var that = this;
		
		node.onDATA('BIDDER', function(msg){
		    that.other = msg.data.other;
		    console.log('OTHER ' + msg.data.other);
		    
		    node.set('ROLE', 'BIDDER');
		    
		    var offer = '40'; // Just make a static bid for now.
		    node.set('offer', offer);
		    node.say(offer, 'OFFER', that.other);
		    
		    node.onDATA('ACCEPT', function(msg){
		        console.log('Your offer was accepted');
		        node.DONE();
		    });
		    
		    node.onDATA('REJECT', function(msg){
		        console.log('Your offer was rejected');
		        node.DONE(); 
		    });
		    
		});
		
		node.onDATA('RESPONDENT', function(msg){
		    that.other = msg.data.other;
		    node.set('ROLE', 'RESPONDENT');
		    
		    node.onDATA('OFFER', function(msg){
		        var offered = '40';
                
                var accept = true; // change if it offer should always be rejected
                
                if(accept){
                    node.set('response', 'ACCEPT');
                    node.say('ACCEPT', 'ACCEPT', that.other);
                    node.DONE();
                } else {
                    node.set('response', 'REJECT');
                    node.say('REJECT', 'REJECT', that.other);
                    node.DONE();
                }
		    });
		});
		
		node.onDATA('SOLO', function() {
            console.log('solodone');
           node.DONE();
        });
	
		console.log('Ultimatum');
	};
	
	var postgame = function(){
	    node.random.emit('DONE');
        // node.window.loadFrame('postgame.html', function(){
        //  node.random.emit('DONE');
        // });
		console.log('Postgame');
	};
	
	var endgame = function(){
        // node.window.loadFrame('ended.html');
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
    // name: "Player1",
    name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum"
    // verbosity: 10
};

nodegame.play(conf, new Fake_Ultimatum_Player());
