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
	

	
})(
	'undefined' != typeof node ? node : module.exports
);