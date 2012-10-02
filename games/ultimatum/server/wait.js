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
						exitcode = codes.select('AccessCode', '=', p.mtid).first().ExitCode;
						checkOut(p.mtid, exitcode, 0);
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
		
		console.log('init!!!!');
	};
	
	var checkOut = function (accesscode, exitcode, bonus, cb) {
		bonus = bonus || 0;
		var checkout = {
	    		"Operation": "CheckOut",
	      		"ServiceKey": "18F072F7850A4BBEB3EF6A372CBECEE3",
	      		"ProjectCode":"7D1503C55EC44EF1A7B31CEB69E8498C",
	      		"AccessCode": accesscode,
	      		"ExitCode": exitcode,
	      		"Bonus": bonus,
	    };

	    request(
      	    { method: 'POST'
      	    , uri: 'https://www.descil.ethz.ch/apps/mturk2/api/service.ashx'
      	    , json: checkout
      	    }
      	  , function (error, response, body) {
      		  if (error) console.log('Error: ' + error);
      		  console.log('Response code: '+ response.statusCode);
      	      console.log(body);
      	      if (!error && cb) {
      	    	  cb();
      	      }
      	    }
	    );
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

//Starting the Game

var node = require('nodegame-client'),
	NDDB = node.NDDB,
	JSUS = node.JSUS,
	request = require('request');

var codes = new NDDB();

var body = {
		 "Operation": "GetCodes",
		 "ServiceKey": "18F072F7850A4BBEB3EF6A372CBECEE3",
		 "ProjectCode":"7D1503C55EC44EF1A7B31CEB69E8498C",
		 "AccessCode":"",
		 "ExitCode":"",
		 "Bonus":0,
		 "Payoffs":[],
		 "Codes":[]
};

request(
	    { method: 'POST'
	    , uri: 'https://www.descil.ethz.ch/apps/mturk2/api/service.ashx'
	    , json: body
	    }
	  , function (error, response, body) {
		  if (error) {
			  console.log(error);
			  console.log('Error. Cannot proceed without the list of valid access codes');
			  throw new Error(error);
		  }
		  console.log('Response code: '+ response.statusCode);
	      codes.importDB(body.Codes);
	      console.log(codes.fetchValues());

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
	    }
);



