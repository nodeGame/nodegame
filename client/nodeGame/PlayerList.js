(function (exports, node) {
	
	/*
	 * Holds information about the list of players.
	 *
	 */
	
	var JSUS = node.Utils;
	var NDDB = node.NDDB;
		
	var GameState = node.GameState;
	
	/**
	 * Expose constructors
	 */
	exports.PlayerList = PlayerList;

	/**
	 * PlayerList interface
	 *
	 * @api public
	 */
	
	function PlayerList (options, db) {
//		
//	  node.log('RECEIVED');	
//	  node.log(db);	
	  var options = options || {};
	  // Inheriting from NDDB	
	  JSUS.extend(node.NDDB, this);
	  node.NDDB.call(this, options, db);
	  //this.set('state', GameBit.compareState);
//	  node.log('JUST CREATED PL');
//	  node.log(this);
	  this.countid = 0;
	};
	
	PlayerList.prototype.add = function (player) {
		if (!player || !player.id) return;
	
		// Check if the id is unique
		if (this.exist(player.id)) {
			node.log('Attempt to add a new player already in the player list' + player.id, 'ERR');
			return false;
		}
		
		this.insert(new Player({
								id: player.id,
								name: player.name,
								count: this.countid
		}));

		this.countid++;
		return true;
	};
	
	PlayerList.prototype.remove = function (id) {
		if (!id) return false;
			
		var p = this.select('id', '=', id);
		if (p.count > 0) {
			p.delete();
			return true;
		}
	
		node.log('Attempt to remove a non-existing player from the the player list. id: ' + id, 'ERR');
		return false;
	};
	
	PlayerList.prototype.get = function (id) {	
		if (!id) return false;
		
		var p = this.select('id', '=', id);
		
		if (p.count > 0) {
			return p.first();
		}
		
		node.log('Attempt to access a non-existing player from the the player list. id: ' + id, 'ERR');
		return false;
	};
	
	PlayerList.prototype.getAllIDs = function () {	
		
		return this.map(function(o){
			return o.id;
			});
	};
	
	
	PlayerList.prototype.updatePlayer = function (player) {
		
		if (this.exist(id)) {
			this.pl[id] = player;
		
			return true;
		}
		
		node.log('Attempt to access a non-existing player from the the player list ' + player.id, 'WARN');
		return false;
	};
	
	PlayerList.prototype.updatePlayerState = function (id, state) {
				
		if (!this.exist(id)) {
			node.log('Attempt to access a non-existing player from the the player list ' + player.id, 'WARN');
			return false;	
		}
		
		if ('undefined' === typeof state) {
			node.log('Attempt to assign to a player an undefined state', 'WARN');
			return false;
		}
		
		//node.log(this.pl);
		
		this.select('id', '=', id).first().state = state;	
	
		return true;
	};
	
	PlayerList.prototype.exist = function (id) {
		return (this.select('id', '=', id).count() > 0) ? true : false;
	};
	
	// TODO: improve
	// Returns true if all the players are on the same gameState = gameState
	// and they are all GameState = DONE.
	// If strict is TRUE, also not initialized players are taken into account
	PlayerList.prototype.isStateDone = function(gameState, strict) {
		
		//node.log('1--------> ' + gameState);
		
		// Check whether a gameState variable is passed
		// if not try to use the node.game.gameState as the default state
		// if node.game has not been initialized yet return false
		if ('undefined' === typeof gameState){
			if ('undefined' === typeof node.game) {
				return false;
			}
			else {
				var gameState = node.game.gameState;
			}
		}
		
		//node.log('2--------> ' + gameState);
		
		var strict = strict || false;
		
		var result = this.map(function(p){
			var gs = new GameState(p.state);
			
			//node.log('Going to compare ' + gs + ' and ' + gameState);
			
			// Player is done for his state
			if (p.state.is !== GameState.iss.DONE) {
				return 0;
			}
			// The state of the player is actually the one we are interested in
			if (GameState.compare(gameState, p.state, false) !== 0) {
				return 0;
			}
			
			return 1;
		});
		
		var i;
		var sum = 0;
		for (i=0; i<result.length;i++) {
			sum = sum + Number(result[i]);
		}
		
		var total = (strict) ? this.size() : this.actives(); 
		
		return (sum === total) ? true : false;
		
	};
	
	// Returns the number of player whose state is different from 0:0:0
	PlayerList.prototype.actives = function (gameState) {
		var result = 0;
		
		this.forEach(function(p){
			var gs = new GameState(p.state);
			
			// Player is done for his state
			if (GameState.compare(gs, new GameState()) !== 0) {
				result++;
			}
			
		});
		
		//node.log('ACTIVES: ' + result);
		
		return result;
	};
	
	PlayerList.prototype.checkState = function (gameState, strict) {
		if (this.isStateDone(gameState,strict)) {
			node.emit('STATEDONE');
		}
	};
	
	PlayerList.prototype.toString = function (eol) {
		
		var out = '';
		var EOL = eol || '\n';
		
		this.forEach(function(p) {
	    	out += p.id + ': ' + p.name;
	    	var state = new GameState(p.state);
	    	out += ': ' + state + EOL;
		});
		return out;
	};
	
	//Player
	
	/**
	 * Expose constructor
	 */
	
	exports.Player = Player;
	
	// TODO make them private
	function Player (pl) {
		var pl = pl || {};
		
		this.id = pl.id;
		this.count = pl.count;
		this.name = pl.name;
		this.state = pl.state || new GameState();
		this.ip = pl.ip;
	}
	
	Player.prototype.toString = function() {
		var out = this.name + ' (' + this.id + ') ' + new GameState(this.state);
		return out;
	};

	
	// TODO: implement pl.pop, maybe in NDDB
//	PlayerList.prototype.pop = function (id) {	
//		var p = this.get(id);
//		if (p) {
//			this.remove(id);
//		}
//		return p;
//	};
	
//	PlayerList.prototype.getRandom = function () {	
//		return this.toArray()[Math.floor(Math.random()*(this.size()))];
//	};
	
	
//	Player.prototype.getId = function() {
//		return this.id;
//	};
//	
//	Player.prototype.getName = function() {
//		return this.name;
//	};
//	
//	Player.prototype.updateState = function (state) {
//		this.state = state;
//	};
	

	
	// Returns an array of array of n groups of players {id: name}
	//The last group could have less elements.
//	PlayerList.prototype.getNGroups = function (n) {
//		
//		var copy = this.toArray();
//		var nPlayers = copy.length;
//		
//		var gSize = Math.floor( nPlayers / n);
//		var inGroupCount = 0;
//		
//		var result = new Array();
//		
//		// Init values for the loop algorithm
//		var i;
//		var idx;
//		var gid = -1;
//		var count = gSize +1; // immediately creates a new group in the loop
//		for (i=0;i<nPlayers;i++){
//			
//			// Prepare the array container for the elements of the new group
//			if (count >= gSize) {
//				gid++;
//				result[gid] = new PlayerList();
//				count = 0;
//			}
//			
//			// Get a random idx between 0 and array length
//			idx = Math.floor(Math.random()*copy.length);
//			
//			result[gid].add(copy[idx].id,copy[idx].name);
//			copy.splice(idx,1);
//			count++;
//		}
//		
//		return result;
//	};

	
//	PlayerList.prototype.toArray = function () {
//	
//		var result = Array();
//		
//		for (var key in this.pl) {
//		    if (this.pl.hasOwnProperty(key)) {
//		    	result.push(this.pl[key]);
//		    }
//		}
//		return result;
//		return result.sort();
//	};
	
//	PlayerList.prototype.forEach = function(callback, thisArg) {
//		  
//		for (var key in this.pl) {
//		    if (this.pl.hasOwnProperty(key)) {
//		    	callback.call(thisArg, this.pl[key]);
//		    }
//		  }
//	};
	
//	PlayerList.prototype.map = function(callback, thisArg) {
//		 
//		 var result = new Array();
//		 
//		 for (var key in this.pl) {
//			 if (this.pl.hasOwnProperty(key)) {
//				 result.push(callback.call(thisArg, this.pl[key]));
//			 }
//		  }
//	
//		  return result;
//	};
	
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);