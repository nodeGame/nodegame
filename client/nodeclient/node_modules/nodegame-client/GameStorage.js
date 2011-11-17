(function (exports, node) {
		
	var GameState = node.GameState;
		
	/**
	 * Expose constructors
	 */
	exports.GameStorage = GameStorage;
	exports.GameBit = GameBit;
	
	
	/**
	 * GameStorage interface
	 *
	 * @api public
	 */
	
	function GameStorage (game, options, storage) {
	  this.game = game;
	  this.options = options;
	  //this.clients = {};
	  this.storage = storage || [];
	};
	
	GameStorage.prototype.add = function (player, key, value, state) {
		var state = state || this.game.gameState;

		this.storage.push(new GameBit({
										player: player, 
										key: key,
										value: value,
										state: state
		}));
	  
//		console.log('Added ' + new GameBit({
//										player: player, 
//										key: key,
//										value: value,
//										state: state
//		}));
		return true;
	};
	
	// Sorting Operation
	
	GameStorage.prototype.reverse = function () {
		return this.storage.reverse();
	};
	
	/**
	 * Sort the game storage according to a certain criteria. 
	 * If not criteria is passed sort by player name.
	 * 
	 */
	GameStorage.prototype.sort = function(func) {
		var func = func || GameBit.comparePlayer;
		return this.storage.sort(func);
	};
	
	GameStorage.prototype.sortByPlayer = function() {
		return this.storage.sort(GameBit.comparePlayer);
	}
	
	GameStorage.prototype.sortByState = function() {
		return this.storage.sort(GameBit.compareState);
	}
	
	GameStorage.prototype.sortByKey = function() {
		return this.storage.sort(GameBit.compareKey);
	}
	
	GameStorage.prototype.dump = function (reverse) {
		return this.storage;
	};	
	
	GameStorage.prototype.toString = function () {
		var out = '';
		for (var i=0; i< this.storage.length; i++) {
			out += this.storage[i] + '\n'
		}	
		return out;
	};	
	
	// Get Objects
	
	/**
	 * Retrieves specific information of combinations of the keys @client,
	 * @state, and @id
	 * 
	 */
	GameStorage.prototype.get = function (gamebit) {
		if (!gamebit) return this.storage;
		var out = [];
		
		for (var i=0; i< this.storage.length; i++) {
			if (GameBit.compare(gamebit,this.storage[i])){
				out.push(this.storage[i]);
			}
		}	
		return (out.length !== 0) ? out : false;
	};
	
	GameStorage.prototype.getByPlayer = function (player) {
		return this.get(new GameBit({player:player}));
	};
	
	GameStorage.prototype.getByState = function (state) {
		return this.get(new GameBit({state:state}));
	};
	
	GameStorage.prototype.getByKey = function (key) {
		return this.get(new GameBit({key:key}));
	};
	
	// Get Values

	GameStorage.prototype.getValues = function (gamebit, key) {
		var storage = this.get(gamebit);
		if (!storage) return false;
		
		switch (key) {
			case 'VALUES_ONLY': 
				var func = GameBit.prototype.getValues;
				break;
			case 'KEY_VALUES':
				var func = GameBit.prototype.getKeyValues; 
				break;
			case 'FULL':
				var func = GameBit.prototype.toArray;
				break;
			default:
				var func = GameBit.prototype.toArray;
		}
		
		var out = [];
		
		for (var i=0; i < storage.length; i++) {
			var line = func.call(storage[i]);
			for (var j=0; j < line.length; j++) {
				// We can have one or two nested arrays
				// We need to open the first array to know it
				if ('object' === typeof line[j]) {
					out.push(line[j]);
				}
				else {
					out.push(line);
					break; // do not add line[j] multiple times
				}
				
			}
		}	
		
		//console.log(out);
		
		return out;
	};
	
	GameStorage.prototype.getKeyValues = function (gamebit) {
		return this.getValues(gamebit,true);
	};
		
	/**
	 * Write data into the memory of a client.
	 * It overwrites data with the same key.
	 * @data can be an object, or an object containing other objects,
	 * but these cannot contain other objects in turn.
	 * 
	 * @param {String} client
	 * @param {Object} data
	 * @param {String} state
	 * 
	 * @api public
	 */
	
//	GameStorage.prototype.add = function (client, data, state) {
//	  if (!this.clients[client]) {
//	    this.clients[client] = {};
//	  }
//	  
//	  var state = state || this.game.gameState.toString();
//	  
//	  if (!this.clients[client][state]) {
//		  this.clients[client][state] = {};
//	  }
//	  
//	  for (var i in data) {
//		  if (data.hasOwnProperty(i)) {
//			  this.clients[client][state][i] = data[i];
//			  //console.log('Added ' +  i + ' ' + data[i]);
//		  }
//	  }
//	  
//	  return true;
//	};
	

	
	/** 
	 *  Reverse the memory: instead of the history of a player for all rounds,
	 *  we get the history of a round of all players
	 */
//	GameStorage.prototype.reverse = function () {
//		var reverse = {};
//		
//		for( var c in this.clients) {
//			if (this.clients.hasOwnProperty(c)) {
//				for (var s in this.clients[c]) {
//					if (this.clients[c].hasOwnProperty(s)) {
//						
//						if (!reverse[s]) {
//							reverse[s] = {};
//						}
//						
//						if (!reverse[s][c]) {
//							reverse[s][c] = {};
//						}
//						
//						var data = this.clients[c][s];
//						
//						for (var i in data) {
//						  if (data.hasOwnProperty(i)) {
//							  reverse[s][c][i] = data[i]; 
//							  console.log('Reversed ' +  i + ' ' + data[i]);
//						  }
//						}
//					}
//			    }
//			}
//		}
//		
//		return reverse;
//	};
		
//	GameStorage.prototype.dump = function (reverse) {
//		
//		return (reverse) ? this.reverse() : this.clients;
//	};

	
//	GameStorage.prototype.getValues = function (reverse) {
//		
//		var values = [];
//		
//		var dump = this.dump(reverse);
//		for (var i in dump) {
//			if (dump.hasOwnProperty(i)) {
//				var line = this.getLine(i, dump);
//				//console.log(line);
//				for (var j in line) {
//					values.push(line[j]);
//				}
//			}
//		}
//		return values;
//	};
	
	/**
	 * Returns an array of arrays. Each row is unique combination of:
	 * 
	 * A) state, client, key1, key2, value
	 * 
	 * or 
	 * 
	 * B) state, client, key1, value
	 * 
	 * Since getLine returns the same array of array, the task is here to merge
	 * all together.
	 * 
	 */
//	GameStorage.prototype.getValues = function (reverse) {
//	
//		var values = [];
//		
//		var dump = this.dump(reverse);
//		for (var i in dump) {
//			if (dump.hasOwnProperty(i)) {
//				var line = this.getLine(i, dump);
//				for (var j in line) {
//
//					// We can have one or two nested arrays
//					// We need to open the first array to know it
//					for (var x in line[j]) {
//						if ('object' === typeof line[j][x]) {
//							values.push(line[j][x]);
//						}
//						else {
//							values.push(line[j]);
//							break; // do not add line[j] multiple times
//						}
//						
//					}
//					
//				}	
//			}
//		}
//		return values;
//	};
	
//	GameStorage.prototype.getValues = function (reverse) {
//		
//		var values = [];
//		
//		var dump = this.dump(reverse);
//		for (var i in dump) {
//			if (dump.hasOwnProperty(i)) {
//				var line = this.getLine(i, dump);
//				for (var j in line) {
//
//					// We can have one or two nested arrays
//					// We need to open the first array to know it
//					for (var x in line[j]) {
//						if ('object' === typeof line[j][x]) {
//							values.push(line[j][x]);
//						}
//						else {
//							values.push(line[j]);
//							break; // do not add line[j] multiple times
//						}
//						
//					}
//					
//				}	
//			}
//		}
//		return values;
//	};
//	
//	GameStorage.prototype.getLine = function (id, storage) {
//		var storage = storage || this.clients;
//		if (!storage[id]) return;
//		
//		var lines = [];
//		// Clients or States
//		for (var i in storage[id]) {
//			if (storage[id].hasOwnProperty(i)) {
//				var line = [];
//				
//				// Variables
//				for (var j in storage[id][i]) {
//					if (storage[id][i].hasOwnProperty(j)) {
//						
//						// Every row contains: client,variable and key1
//						// It could be that we have a nested array, and for this
//						// we need to check whether to a value or a pair key2,value
//						var inner_line = [id,i,j];
//						
//						// Is it a nested {} ?
//						if ('object' === typeof storage[id][i][j]) { 
//							for (var x in storage[id][i][j]) {
//								
//								if (storage[id][i][j].hasOwnProperty(x)) {
//									inner_line.push(x);
//									inner_line.push(storage[id][i][j][x]);
//									line.push(inner_line);
//									inner_line = [id,i,j]; // reset
//								}
//							}
//						}
//						else {
//							inner_line.push(storage[id][i][j]);
//							line.push(inner_line);
//							inner_line = [id,i,j]; // reset
//						}
//					}
//				}
//				lines.push(line);
//			}
//		}
//		//console.log(lines);
//		return lines;	
//	};
	
//	/**
//	 * Retrieves specific information of combinations of the keys @client,
//	 * @state, and @id
//	 * 
//	 */
//	GameStorage.prototype.get = function (client, state, id) {
//		
//		var storage = this.clients;
//		
//		if (client) {
//			storage = this.getClient(client, storage);
//		}
//		
//		if (state) {
//			storage = this.getState(state, storage);
//		}
//		
//		if (id) {
//			storage = this.getId(id, storage);
//		}
//		
//		return storage;
//	};
	
//	/**
//	 * Retrieves specific information of combinations of the keys @client,
//	 * @state, and @id
//	 * 
//	 */
//	GameStorage.prototype.get = function (player, state, key, storage) {
//		var gb = new GameBit({player: player, state: state, key: key});
//		
//		var storage = storage || this.clients;
//		var out = [];
//		for (var i = 0; i < storage.length; i++) {
//			if (GameBit.compare(gb, storage[i])) {
//				out.push(storage[i]);
//		};
//		
//		return out;
//	};
//	
//	/** 
//	 * Retrives all the information associated to client @client.
//	 * Notice that, in fact, this method returns all the information 
//	 * associated with key @client at the /first/ level of the @storage obj.
//	 * 
//	 */
////	GameStorage.prototype.getClient = function (client, storage) {
////		if (!client) return;
////		var storage = storage || this.clients;
////		return ('undefined' !== typeof storage[client]) ? storage[client] : false;
////	};
//	GameStorage.prototype.getClient = function (client, storage) {
//		if (!client) return;
//		var storage = storage || this.clients;
//		for ()
//		return ('undefined' !== typeof storage[client]) ? storage[client] : false;
//	};
//	
//	/** 
//	 * Retrives all the information associated to state @state.
//	 * Notice that, in fact, this method returns all the information 
//	 * associated with key @state at the /second/ level of the @storage obj.
//	 * 
//	 */
//	GameStorage.prototype.getState = function (state, storage) {
//		if (!state) return;
//		var storage = storage || this.clients;
//		var out = [];
//		
//		// Loop along all the clients
//		for (var c in storage) {
//			if (storage.hasOwnProperty(c)) {
//	
//				if ('undefined' !== typeof storage[c][state]) {
//					out.push(storage[c][state]);
//					console.log('S ' + storage[c][state]);
//				}
//			}
//		}
//		
//		return (out.length !== 0) ? out : false;
//	};
//	
//	/** 
//	 * Retrives all the information associated to state @id.
//	 * Notice that, in fact, this method returns all the information 
//	 * associated with key @id at the /third/ level of the @storage obj.
//	 * 
//	 */
//	GameStorage.prototype.getId = function (id, storage) {
//		if (!id) return;
//		var storage = storage || this.clients;
//		var out = [];
//		
//		// Loop along all the clients
//		for (var c in storage) {
//			if (storage.hasOwnProperty(c)) {
//				// Loop along all states
//				for (var s in storage.c) {
//					if (storage.c.hasOwnProperty(s)) {	
//						
//						if ('undefined' !== typeof storage[c][s][id]) {
//							out.push(storage[c][s][id]);
//						}
//					}
//				}
//			}
//		}
//		
//		return (out.length !== 0) ? out : false;
//	};
	
	/**
	 * GameBit
	 * 
	 * Container for a bit of relevant information for the game
	 */
	
	function GameBit (options) {
		
		this.state = options.state;
		this.player = options.player;
		this.key = options.key;
		this.value = options.value;
	};
	
	GameBit.prototype.isComplex = function() {
		return ('object' === typeof this.value) ? true : false;
	};
	
	
	GameBit.prototype.getValues = function (head) {		
		var head = head || [];
		
		if (!this.isComplex()) {
			var out = head;
			out.push(this.value);
			return out;
		}
		
		var out = [];
		var line = head.slice(0); // Clone the head array without pointing to same ref
		
		for (var i in this.value) {
			if (this.value.hasOwnProperty(i)) {
				line.push(i);
				line.push(this.value[i]);
				out.push(line);
				line = head.slice(0);
			}
		}
		//console.log(out);
		return out;
	};
	
	GameBit.prototype.toArray = function() {
		var head = [this.player,this.state.toString(),this.key];
		return this.getValues(head);
	};
	
	GameBit.prototype.getKeyValues = function() {
		return this.getValues([this.key]);
	};
	
	GameBit.prototype.toString = function () {
//		console.log(GameState.stringify(this.state));
		return this.player + ', ' + GameState.stringify(this.state) + ', ' + this.key + ', ' + this.value;
	};
	
	/** 
	 * Compares two GameBit objects.
	 * The Comparison is made only if the attributes are set in the first object
	 * Return true if the attributes of gb1 (player, state, and key) are identical. 
	 * Undefined values are skip.
	 *  
	 * If strict is set, it compares also the values of the two objects.
	 *  
	 */
	GameBit.compare = function (gb1, gb2, strict) {
		if(!gb1 || !gb2) return false;
		var strict = strict || false;
		if (gb1.player && GameBit.comparePlayer(gb1, gb2) !== 0) return false;
		if (gb1.state && GameBit.compareState(gb1, gb2) !== 0) return false;
		if (gb1.key && GameBit.compareKey(gb1, gb2) !== 0) return false;
		if (strict && gb1.value && GameBit.compareValue(gb1, gb2) !== 0) return false;
		return true;	
	};
	
	GameBit.comparePlayer = function (gb1, gb2) {
		if (gb1.player === gb2.player) return 0;
		// Assume that player is a numerical id
		if (gb1.player > gb2.player) return 1;
		return -1;
	};
	
	GameBit.compareState = function (gb1, gb2) {
		return GameState.compare(gb1.state,gb2.state);
	};
	
	GameBit.compareKey = function (gb1, gb2) {
		if (gb1.key === gb2.key) return 0;
		// Sort alphabetically or by numerically ascending
		if (gb1.key > gb2.key) return 1;
		return -1;
	};
	
	// @TODO: check how this works with objects
	GameBit.compareValue = function (gb1, gb2) {
		if (gb1.value === gb2.value) return 0;
		// Sort alphabetically or by numerically ascending
		if (gb1.value === gb2.value) return 1;
		return -1;
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);