/*
 * Holds information about the list of players.
 *
 */

var util = require('util');

var Utils = require('./Utils');
var GameState = require('./GameState');

module.exports = {
					"PlayerList": PlayerList,
					"Player": Player
				};


function PlayerList(list) {
	
	this.pl = list || {};
	
	this.size = function() {
		return Utils.getListSize(this.pl);
	};
//	console.log('This is the size ' + this.size());
}

//PlayerList.prototype.importIDS = function(listIDS) {
//	
//	var PREFIX = 'P_';
//	var i= this.size();
//	for (var key in listIDS) {
//	    if (listIDS.hasOwnProperty(key)) {
//	    	this.add(listIDS[key],'P_' + ++i);
//	    }
//	}
//};

PlayerList.prototype.importIDS = function(arrayIDS) {
	
	var PREFIX = 'P_';
	var i = this.size();
	var j = 0;
	for (;j<arrayIDS.length;j++){
    	this.add(arrayIDS[j],'P_' + ++i);
	}
};


// Check Here!!! 

PlayerList.prototype.addPlayer = function (player) {
	return this.add(player.id, player.name);
};

PlayerList.prototype.add = function (connid,name) {	
	// Check if the id is unique
	if (typeof(this.pl[connid]) === 'undefined') {
		this.pl[connid] = new Player({id: connid, name: name});
		console.log('Added Player ' + this.pl[connid]);
		return true;
	}
		
	console.log('E: Attempt to add a new player already in the player list' + this.pl.id);//[connid]);
	return false;
};

//PlayerList.prototype.add = function (connid,name) {	
//	// Check if the id is unique
//	if (typeof(this.pl[connid]) === 'undefined') {
//		this.pl[connid] = new Player(connid,name);
//		return true;
//	}
//		
//	console.log('E: Attempt to add a new player already in the player list ' + connid + '-' + name);//[connid]);
//	return false;
//};

PlayerList.prototype.remove = function (connid) {	
	// Check if the id exists
	if (typeof(this.pl[connid]) !== 'undefined') {
		delete this.pl[connid];
		return true;
	}
	
	console.log('E: Attempt to remove a non-existing player from the the player list ' + connid);
	return false;
};

PlayerList.prototype.get = function (connid) {	
	// Check if the id exists
	if (typeof(this.pl[connid]) !== 'undefined') {
		return this.pl[connid];
	}
	
	console.log('W: Attempt to access a non-existing player from the the player list ' + connid);
	//console.log(util.inspect(this.pl));
	
	return false;
};

PlayerList.prototype.pop = function (connid) {	
	var p = this.get(connid);
	this.remove(connid);
	return p;
};

PlayerList.prototype.getRandom = function () {	
	return this.toArray()[Math.floor(Math.random()*(this.size()))];
};


PlayerList.prototype.getAllIDs = function () {	
	
     return this.map(function(o){
    	 return o.getId();
     	});
//     
//	 var result = new Array();
//	 
//	 for (var key in this.pl) {
//		 if (this.pl.hasOwnProperty(key)) {
//			 result.push(key);
//		 }
//	  }
//
//	  return result;
};

PlayerList.prototype.updatePlayer = function (player) {
	
	if (typeof(this.pl[player.id]) !== 'undefined') {
		this.pl[connid] = player;
		return true;
	}
	
	console.log('W: Attempt to access a non-existing player from the the player list ' + player.id);
	return false;
};


// Returns an array of array of n groups of players {id: name}
//The last group could have less elements.
PlayerList.prototype.getNGroups = function (n) {
	
	var copy = this.toArray();
	var nPlayers = copy.length;
	
	var gSize = Math.floor( nPlayers / n);
	var inGroupCount = 0;
	
	var result = new Array();
	
	// Init values for the loop algorithm
	var i;
	var idx;
	var gid = -1;
	var count = gSize +1; // immediately creates a new group in the loop
	for (i=0;i<nPlayers;i++){
		
		// Prepare the array container for the elements of the new group
		if (count >= gSize) {
			gid++;
			result[gid] = new PlayerList();
			count = 0;
		}
		
		// Get a random idx between 0 and array length
		idx = Math.floor(Math.random()*copy.length);
		
		result[gid].add(copy[idx].getId(),copy[idx]);
		copy.splice(idx,1);
		count++;
	}
	
	return result;
};

// Returns an array of array of groups of n players {id: name};
// The last group could have less elements.
PlayerList.prototype.getGroupsSizeN = function (n) {
	// TODO: getGroupsSizeN
};

//Returns true if all the players are on the same gameState = gameState
//and they are all GameState = DONE.
PlayerList.prototype.isStateDone = function(gameState) {
	
	this.forEach(function(p){
		var gs = new GameState(p.state);
		
		console.log('Going to compare ' + gs);
		
		// Player is done for his state
		if (p.state.is !== GameState.DONE) {
			return false;
		}
		// The state of the player is actually the one we are interested in
		if (GameState.compare(gameState, p.state, true) !== 0) {
			return false;
		}
	});

	return true;
};

// PL Utils

PlayerList.prototype.toArray = function () {

	var result = Array();
	
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	result.push(this.pl[key]);
	    }
	}
	return result;
	return result.sort();
	
};

PlayerList.prototype.forEach = function(callback, thisArg) {
	  
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	callback.call(thisArg, this.pl[key]);
	    }
	  }
};

PlayerList.prototype.map = function(callback, thisArg) {
	 
	 var result = new Array();
	 
	 for (var key in this.pl) {
		 if (this.pl.hasOwnProperty(key)) {
			 result.push(callback.call(thisArg, this.pl[key]));
		 }
	  }

	  return result;
};


PlayerList.prototype.toString = function () {
	
	var out = '';
	
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	out += this.pl[key] + "\n";
	    }
	}
	
	return out;
	
};

//Player

function Player (pl) {
	
	// PRIVATE variables
	this.id = pl.id;
	this.name = pl.name;
	this.state = pl.state || new GameState();
}

Player.prototype.getId = function() {
	return this.id;
};

Player.prototype.getName = function() {
	return this.name;
};

//Player.prototype.import = function (player) {
//	this.id = player.id;
//	this.name = player.name;
//	this.state = player.state;
//};

Player.prototype.updateState = function (state) {
	this.state = state;
};

//Player.parse = function(player) {
//	try {
//		var p = new Player();
//		p.import(player);
//		return p;
//	}
//	catch(e){
//		throw 'Error while trying to parse Player ' + e.message;
//	}
//};

Player.prototype.toString = function() {
	var out = this.getName() + ' (' + this.getId() + ') ' + new GameState(this.state);
	return out;
};
//
//function Player(id, name, state) {
//	
//	// PRIVATE variables
//	this.id = id;
//	this.name = name;
//	this.state = state || new GameState();
//}
//
//Player.prototype.getId = function() {
//	return this.id;
//};
//
//Player.prototype.getName = function() {
//	return this.name;
//};
//
//Player.prototype.import = function (player) {
//	this.id = player.id;
//	this.name = player.name;
//	this.state = player.state;
//};
//
//Player.prototype.updateState = function (state) {
//	this.state = state;
//};
//
//Player.parse = function(player) {
//	try {
//		var p = new Player();
//		p.import(player);
//		return p;
//	}
//	catch(e){
//		throw 'Error while trying to parse Player ' + e.message;
//	}
//};
//
//Player.prototype.toString = function() {
//	var out = this.getName() + ' (' + this.getId() + ') ' + GameState.parse(this.state);
//	return out;
//};