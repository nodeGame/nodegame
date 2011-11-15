(function (exports) {
	
	
	/**
	 * Expose constructor
	 */
	exports.GameStorage = GameStorage;
	
	/**
	 * GameStorage interface
	 *
	 * @api public
	 */
	
	function GameStorage (game, options) {
	  this.game = game;
	  this.options = options;
	  this.clients = {};
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
	
	GameStorage.prototype.add = function (client, data, state) {
	  if (!this.clients[client]) {
	    this.clients[client] = {};
	  }
	  
	  var state = state || this.game.gameState.toString();
	  
	  if (!this.clients[client][state]) {
		  this.clients[client][state] = {};
	  }
	  
	  for (var i in data) {
		  if (data.hasOwnProperty(i)) {
			  this.clients[client][state][i] = data[i];
			  //console.log('Added ' +  i + ' ' + data[i]);
		  }
	  }
	  
	  return true;
	};
	
	/** 
	 *  Reverse the memory: instead of the history of a player for all rounds,
	 *  we get the history of a round of all players
	 */
	GameStorage.prototype.reverse = function () {
		var reverse = {};
		
		for( var c in this.clients) {
			if (this.clients.hasOwnProperty(c)) {
				for (var s in this.clients[c]) {
					if (this.clients[c].hasOwnProperty(s)) {
						
						if (!reverse[s]) {
							reverse[s] = {};
						}
						
						if (!reverse[s][c]) {
							reverse[s][c] = {};
						}
						
						var data = this.clients[c][s];
						
						for (var i in data) {
						  if (data.hasOwnProperty(i)) {
							  reverse[s][c][i] = data[i]; 
							  console.log('Reversed ' +  i + ' ' + data[i]);
						  }
						}
					}
			    }
			}
		}
		
		return reverse;
	};
	
	GameStorage.prototype.dump = function (reverse) {
		
		return (reverse) ? this.reverse() : this.clients;
	};
	
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
	GameStorage.prototype.getValues = function (reverse) {
	
		var values = [];
		
		var dump = this.dump(reverse);
		for (var i in dump) {
			if (dump.hasOwnProperty(i)) {
				var line = this.getLine(i, dump);
				for (var j in line) {

					// We can have one or two nested arrays
					// We need to open the first array to know it
					for (var x in line[j]) {
						if ('object' === typeof line[j][x]) {
							values.push(line[j][x]);
						}
						else {
							values.push(line[j]);
							break; // do not add line[j] multiple times
						}
						
					}
					
				}	
			}
		}
		return values;
	};
	
	GameStorage.prototype.getLine = function (id, storage) {
		var storage = storage || this.clients;
		if (!storage[id]) return;
		
		var lines = [];
		// Clients or States
		for (var i in storage[id]) {
			if (storage[id].hasOwnProperty(i)) {
				var line = [];
				
				// Variables
				for (var j in storage[id][i]) {
					if (storage[id][i].hasOwnProperty(j)) {
						
						// Every row contains: client,variable and key1
						// It could be that we have a nested array, and for this
						// we need to check whether to a value or a pair key2,value
						var inner_line = [id,i,j];
						
						// Is it a nested {} ?
						if ('object' === typeof storage[id][i][j]) { 
							for (var x in storage[id][i][j]) {
								
								if (storage[id][i][j].hasOwnProperty(x)) {
									inner_line.push(x);
									inner_line.push(storage[id][i][j][x]);
									line.push(inner_line);
									inner_line = [id,i,j]; // reset
								}
							}
						}
						else {
							inner_line.push(storage[id][i][j]);
							line.push(inner_line);
							inner_line = [id,i,j]; // reset
						}
					}
				}
				lines.push(line);
			}
		}
		//console.log(lines);
		return lines;	
	};
	
	/**
	 * Retrieves specific information of combinations of the keys @client,
	 * @state, and @id
	 * 
	 */
	GameStorage.prototype.get = function (client, state, id) {
		
		var storage = this.clients;
		
		if (client) {
			storage = this.getClient(client, storage);
		}
		
		if (state) {
			storage = this.getState(state, storage);
		}
		
		if (id) {
			storage = this.getId(id, storage);
		}
		
		return storage;
	};
	
	/** 
	 * Retrives all the information associated to client @client.
	 * Notice that, in fact, this method returns all the information 
	 * associated with key @client at the /first/ level of the @storage obj.
	 * 
	 */
	GameStorage.prototype.getClient = function (client, storage) {
		if (!client) return;
		var storage = storage || this.clients;
		return ('undefined' !== typeof storage[client]) ? storage[client] : false;
	};
	
	/** 
	 * Retrives all the information associated to state @state.
	 * Notice that, in fact, this method returns all the information 
	 * associated with key @state at the /second/ level of the @storage obj.
	 * 
	 */
	GameStorage.prototype.getState = function (state, storage) {
		if (!state) return;
		var storage = storage || this.clients;
		var out = [];
		
		// Loop along all the clients
		for (var c in storage) {
			if (storage.hasOwnProperty(c)) {
	
				if ('undefined' !== typeof storage[c][state]) {
					out.push(storage[c][state]);
					console.log('S ' + storage[c][state]);
				}
			}
		}
		
		return (out.length !== 0) ? out : false;
	};
	
	/** 
	 * Retrives all the information associated to state @id.
	 * Notice that, in fact, this method returns all the information 
	 * associated with key @id at the /third/ level of the @storage obj.
	 * 
	 */
	GameStorage.prototype.getId = function (id, storage) {
		if (!id) return;
		var storage = storage || this.clients;
		var out = [];
		
		// Loop along all the clients
		for (var c in storage) {
			if (storage.hasOwnProperty(c)) {
				// Loop along all states
				for (var s in storage.c) {
					if (storage.c.hasOwnProperty(s)) {	
						
						if ('undefined' !== typeof storage[c][s][id]) {
							out.push(storage[c][s][id]);
						}
					}
				}
			}
		}
		
		return (out.length !== 0) ? out : false;
	};
	
	
	function GameBit (options) {
		
		this.state = options.state;
		this.player = options.player;
		this.key = options.key;
		this.value = options.value;
	};
	
	GameBit.prototype.isComplex = function() {
		return ('object' === typeof this.value) ? true : false;
	};
	
	GameBit.prototype.getValues = function() {
		
		if (!this.isComplex()) return this.value;
		
		var out = [];
		for (var i in this.value) {
			if (this.value.hasOwnProperty(i)) {
				out.push(this.value[i]);
			}
		}
		
		return out;
	};
	
	GameBit.prototype.getKeyValues = function() {
		
		var out = [];
		
		if (!this.isComplex()){
			out[this.key] = this.value;
			return out;
		}
		
		var line = [];
		for (var i in this.value) {
			if (this.value.hasOwnProperty(i)) {
				line.push(this.key);
				line.push(i),
				line.push(this.value[i]);
			}
			out.push(line);
			line = [];
		}
		
		return out;
	};
	
	GameBit.prototype.toString = function () {
		var out = this.state + '.' + this.step + ':' + this.round + '_' + this.is;
		
		if (this.paused) {
			out += ' (P)';
		}
		return out;
	};
	
	/** 
	 *  Compares the GameState of two GameBits. 
	 *  If they are equal returns 0,
	 *  If gb1 is more ahead returns 1, vicersa -1;
	 *  
	 */
	GameBit.compare = function (gb1, gb2) {
		return GameState.compare(gb1.state, gb2.state);
	};
	
	
	
})(
	'undefined' != typeof node ? node : module.exports
);