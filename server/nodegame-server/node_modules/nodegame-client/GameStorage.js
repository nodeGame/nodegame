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
	
	GameStorage.prototype.dump = function () {
	
		return this.clients;
	};
	

	
})(
	'undefined' != typeof node ? node : module.exports
);