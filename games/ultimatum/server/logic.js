var request = require('request');
var NDDB = require('NDDB').NDDB;

function Ultimatum () {

	this.name = 'Backend logic for Ultimatum Game';
	this.description = 'No Description';
	this.version = '0.2';
	
	this.minPlayers = 3;
	this.maxPlayers = 10;
	
	this.automatic_step = true;
	
	this.SHOWUP = 5000;
	
	this.init = function () {

		//node.on('in.set.DATA', function(msg) {
		// if (msg.text === 'response')
		node.onDATA('response', function(msg) {
			var response = msg.data;
			if (!response) return;
			if (response.response === 'ACCEPT') {
				var p = node.game.pl.get(msg.from);
				if (!p.win) {
					p.win = response.value;
				}
				else {
					p.win+= response.value;
				}
				
				node.log('Added to respondent ' + msg.from + ' ' + response.value + ' ECU');
			
				p = node.game.pl.get(msg.from);
				p.win+= response.value;
				node.log('Added to bidder ' + p.id + ' ' + response.value + ' ECU');
			}
		});
	};
	
	var checkOut = function (accesscode, exitcode, bonus) {
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
      	    }
	    );
	};
	
	var pregame = function () {
		var that = this;
		node.log(codes.fetch());
		node.on('UPDATED_PLIST', function(){
			
			// Security check
			var mtid, found;
			node.game.pl.each(function(p){
				mtid = p.mtid;
				found = codes.select('AccessCode', '=', mtid);
				
				if (!found) {
					node.log('Found invalid access code ' + mtid + ' for player ' + p.id);
					return;
				}
				  
				if (found.length > 1) {
					node.log('Access code used multiple times: ' + mtid);
					found.each(function(p){
						node.log(' - player: ' + p.id);
					});
					return;
				}
				
				// Setting default winning
				p.win = that.SHOWUP;
			
			});
			
		});
		
		console.log('Pregame');
	};
	
	var instructions = function () {	
		console.log('Instructions');
	};
		
	var game = function () {
		var that = this;
		// Pairs all players
		var groups = this.pl.getGroupsSizeN(2);
	
		node.log('PAIRS');
		node.log(groups.length);
		
		var i;
		var g = null;
		for ( i = 0; i < groups.length; i++) {
			g = groups[i];
			if (g.length > 1) {
				g.shuffle();
				// Bidder
				var bidder = g.first();
				var respondent = g.last();
				
				var data_b = {
						role: 'bidder',
						other: respondent.id
				};
				var data_r = {
						role: 'respondent',
						other: bidder.id
				};
				
				// Send a message to each player with their role
				// and the id of the player they play against
				node.say(data_b, 'BIDDER', bidder.id);
				node.say(data_r, 'RESPONDENT', respondent.id);
				
				node.log('SENT BIDDER AND RESPONDENT');
				node.log(bidder.id);
				node.log(respondent.id);
				
			}
			// Someone was not paired. Let him wait
			else {
				var solo = g.first();
				node.say('SOLO', 'SOLO', solo.id);
				node.log('SENT SOLO');
				node.log(solo.id);
				
			}	
		}
		
	//	setTimeout(function(){
	//		node.log(node.game.memory.fetch());
	//	}, 2000);
		
		console.log('Game');
	};
	
	var postgame = function () {
		console.log('Postgame');
	};
	
	var endgame = function () {
		node.game.memory.save('./results.nddb');	
		
		var exitcode;
		node.game.pl.each(function(p){
			exitcode = codes.select('AccessCode', '=', p.mtid).first().ExitCode;
			checkOut(p.mtid, exitcode, p.win);
			node.say(p.win, 'WIN', p.id);
		});
		
	      
	    
	    console.log('FINAL PAYOFF PER PLAYER');
	    console.log('***********************');
	    console.log(node.game.pl.keep(['mtid', 'win']).fetch());
	    
	    console.log('***********************');
	      
	    	      
		console.log('Game ended');
	};
	
	
	
	// Creating the Game Loop	
	this.loops = {
			
			1: {state:	pregame,
				name:	'Game will start soon'
			},
			
			2: {state: 	instructions,
				name: 	'Instructions'
			},
				
			3: {rounds:	10, 
				state: 	game,
				name: 	'Game'
			},
			
			4: {state:	postgame,
				name: 	'Questionnaire'
			},
				
			5: {state:	endgame,
				name: 	'Thank you'
			}
	};	

}

/// Start it!

if ('object' === typeof module && 'function' === typeof require) {
	//var node = require('../../../node_modules/nodegame-server/node_modules/nodegame-client');
	var node = require('nodegame-client');
	var JSUS = node.JSUS;
	
	module.exports.node = node;
	module.exports.Ultimatum = Ultimatum;
}

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
	    		name: "P_" + Math.floor(Math.random()*100),
	    		url: "http://localhost:8080/ultimatum/admin",
	    		io: {
	    		    'reconnect': false,
	    		    'transports': ['xhr-polling'],
	    		    'polling duration': 10
	    		},
	    		verbosity: 0,
	    	};

	    	node.play(conf, new Ultimatum());
	    }
);


