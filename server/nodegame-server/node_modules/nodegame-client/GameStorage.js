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
	 * Write data into the memory of a client
	 * It overwrites the same key
	 * 
	 * @param {String} client
	 * @data {Object}
	 * @api public
	 */
	
	GameStorage.prototype.add = function (client, data) {
	  if (!this.clients[client]) {
	    this.clients[client] = {};
	  }
	  var state = this.game.gameState.toString();
	  if (!this.clients[client][state]) {
		  this.clients[client][state] = {};
	  }
	  
	  for (var i in data) {
		  if (data.hasOwnProperty(i)) {
			  this.clients[client][state][i] = data[i];
			  console.log('Added ' +  i + ' ' + data[i]);
		  }
	  }
	  
	  if (this.dump(reverse))
	  
	  return true;
	};
	
	// Reverse the memory: instead of the history of a player for all rounds,
	// we get the history of a round of all players
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
	
	GameStorage.prototype.getValues = function (reverse) {
		
		var values = [];
		
		var dump = this.dump(reverse);
		for (var i in dump) {
			if (dump.hasOwnProperty(i)) {
				var line = this.getLine(i, dump);
				for (var j in line) {
					values.push(line[j]);
				}
			}
		}
		return values;
	};
	
	GameStorage.prototype.getLine = function (id, storage) {
		var storage = storage || this.clients;
		if (!storage[id]) return;
		
		var lines = [];
		
		for (var i in storage[id]) {
			if (storage[id].hasOwnProperty(i)) {
				var line = [];
				line.push(id);
				line.push(i);
				
				for (var j in storage[id][i]) {
					if (storage[id][i].hasOwnProperty(j)) {
						line.push(storage[id][i][j]);
					}
				}
				
				lines.push(line);
			}
		}
		
		return lines;	
	};
})(
	'undefined' != typeof node ? node : module.exports
);