//////////////////////////////////////////////
// nodeGame Ultimatum Game - display results 
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
	this.version = '0.2';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;
	
	this.observer = true;
	
	this.init = function() {
		
		///////////////////////////////////////////
		// nodeGame widgets are reusable objects
		// that can be loaded on the user's screen
		// to perform a specific task.
		//
		// D3ts creates a time series plot where
		// new data can be added by emitting events.
		///////////////////////////////////////////
		this.d3ts = node.widgets.append('D3ts', document.getElementById('body'), {
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
		    },
		    event: 'AVGBID',
		});
		    
	    var avgbidwin = 0,
	    	totbidwin = 0,
	        countbid = 0;
	    
	    node.onDATA('response', function(msg) {
	        var response = msg.data;
	        if (!response) return;
	        countbid++;
	        if (response.response === 'ACCEPT') {
	        	var resWin, bidWin;
	            
	            bidWin = parseInt(response.value);
	            resWin = 100 - bidWin;
	            totbidwin += bidWin;
	        }
	        avgbidwin = totbidwin / countbid;
	        node.emit('AVGBID', avgbidwin);
	        W.getElementById('AVG').innerHTML = avgbidwin.toFixed(2);
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