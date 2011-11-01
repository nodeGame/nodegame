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
	
	function GameStorage (options) {
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
	  
	  for (var i in data) {
		  if (data.hasOwnProperty(i)){
			  this.clients[client][i] = data[i];
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