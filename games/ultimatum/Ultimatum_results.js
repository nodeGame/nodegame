//////////////////////////////////////////////
// nodeGame Ultimatum Game 
//
// Extensively documented tutorial for
// nodeGame beginners.
//
// http://www.nodegame.org
//
/////////////////////////////////////////////

function Ultimatum_results () {
	
	this.name = 'Ultimatum_results';
	this.description = 'Display results of ultimatum game in real time';
	this.version = '0.1';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;
	
	this.observer = true;

//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	this.init = function() {
		 this.d3ts = W.addWidget('D3ts', document.getElementById('root'), {
		    	fieldset: false,
		    	n: 10,
		    	width: 400,
		    	height: 200,
		    	margin: {
		    		top: 10,
		    		bottom: 10,
		    		left: 10,
		    		right: 10
		    	},
		    	domain: {
		    		y: [0, 100] 
		    	}
		    });
		    
		    var avgbidwin = 0,
		    	totbidwin = 0,
		        countbid = 0;
		    
		    node.onDATA('response', function(msg) {
		    	console.log(msg)
		    	if (msg.text !== 'response') return;
		        var response = msg.data;
		        if (!response) return;
		        countbid++;
		        if (response.response === 'ACCEPT') {
		        	var resWin, bidWin;
		            
		            resWin = parseInt(response.value);
		            bidWin = 100 - resWin;
		            totbidwin += bidWin;
		        }
		        avgbidwin = totbidwin / countbid;
		        console.log(avgbidwin);
		        console.log(totbidwin);
		        console.log(countbid);
		        node.emit('D3', avgbidwin);
		      });
	};

	var waiting = function() {		
		node.log('Plotting ready');
	};
	

	this.loops = {
		1: {state: waiting,
			name: 'Plotting room'
		},
	};	
}