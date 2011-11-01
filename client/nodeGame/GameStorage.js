(function (exports, node) {
	
	
	/**
	 * Expose the constructor.
	 */
	
	exports = module.exports = GameStorage;
	
	/**
	 * Module dependencies.
	 */
	
	var EventEmitter = process.EventEmitter;
	
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
	 * Inherit from EventEmitter.
	 */
	
	GameStorage.prototype.__proto__ = EventEmitter.prototype;
	
	/**
	 * Initializes a client GameStorage
	 *
	 * @param {String} id
	 * @api public
	 */
	
	GameStorage.prototype.client = function (id) {
	  if (!this.clients[id]) {
	    this.clients[id] = new (this.constructor.Client)(this, id);
	  }
	
	  return this.clients[id];
	};
	
	/**
	 * Destroys a client
	 *
	 * @api {String} sid
	 * @param {Number} number of seconds to expire client data
	 * @api private
	 */
	
	GameStorage.prototype.destroyClient = function (id, expiration) {
	  if (this.clients[id]) {
	    this.clients[id].destroy(expiration);
	    delete this.clients[id];
	  }
	
	  return this;
	};
	
	/**
	 * Destroys the GameStorage
	 *
	 * @param {Number} number of seconds to expire client data
	 * @api private
	 */
	
	GameStorage.prototype.destroy = function (clientExpiration) {
	  var keys = Object.keys(this.clients)
	    , count = keys.length;
	
	  for (var i = 0, l = count; i < l; i++) {
	    this.destroyClient(keys[i], clientExpiration);
	  }
	
	  this.clients = {};
	
	  return this;
	};
	
	/**
	 * Client.
	 *
	 * @api public
	 */
	
	GameStorage.Client = function (GameStorage, id) {
	  this.GameStorage = GameStorage;
	  this.id = id;
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);