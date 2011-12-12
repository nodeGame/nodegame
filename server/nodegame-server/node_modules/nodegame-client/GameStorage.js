(function (exports, node) {
	
	/**
	 * 
	 * GameStorage provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a new GameStorage obj (can be concatenated):
	 * 
	 * 		- filter 			-> execute callback
	 * 		- select			-> evaluate string
	 * 		- get				-> evaluate an obj
	 * 		- sort 				->
	 * 		- reverse			->
	 * 		
	 * Return an array of GameBits or their values:
	 * 
	 * 		- fetch
	 * 
	 * TODO: update and delete methods
	 * 
	 */
	
	var GameState = node.GameState;
	var Utils = node.Utils;
	
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
	  this.storage = storage || [];
	  
	  this.size = function() { return this.storage.length };
	};
	
	GameStorage.prototype.count = function (key) {
		var count = 0;
		for (var i=0; i < this.storage.length; i++) {
			try {
				var tmp = Utils.eval('this.' + key, this.storage[i]);
				if ('undefined' !== typeof tmp) {
					count++;
				}
			}
			catch (e) {};
		}	
		return count;
	};
	
	GameStorage.prototype.sum = function (key) {
		var sum = 0;
		for (var i=0; i < this.storage.length; i++) {
			try {
				var tmp = Utils.eval('this.' + key, this.storage[i]);
				if (!isNaN(tmp)) {
					sum += tmp;
				}
			}
			catch (e) {};
		}	
		return sum;
	};
	
	GameStorage.prototype.mean = function (key) {
		var sum = 0;
		var count = 0;
		for (var i=0; i < this.storage.length; i++) {
			try {
				var tmp = Utils.eval('this.' + key, this.storage[i]);
				if (!isNaN(tmp)) { 
					//console.log(tmp);
					sum += tmp;
					count++;
				}
			}
			catch (e) {};
		}	
		return (count === 0) ? 0 : sum / count;
	};
	
	GameStorage.prototype.min = function (key) {
		var min = false;
		for (var i=0; i < this.storage.length; i++) {
			try {
				var tmp = Utils.eval('this.' + key, this.storage[i]);
				if (!isNaN(tmp) && tmp < min) {
					min = tmp;
				}
			}
			catch (e) {};
		}	
		return min;
	};

	GameStorage.prototype.max = function (key) {
		var max = false;
		for (var i=0; i < this.storage.length; i++) {
			try {
				var tmp = Utils.eval('this.' + key, this.storage[i]);
				if (!isNaN(tmp) && tmp < max) {
					max = tmp;
				}
			}
			catch (e) {};
		}	
		return max;
	};
	
	
	GameStorage.prototype.map = function (func) {
		var result = [];
		for (var i=0; i < this.storage.length; i++) {
			result[i] = func.call(this.storage[i]);
		}	
		return result;
	};
	
	GameStorage.prototype.forEach = function (func) {
		for (var i=0; i < this.storage.length; i++) {
			func.call(this.storage[i]);
		}	
	};
	
	GameStorage.prototype.add = function (player, key, value, state) {
		var state = state || this.game.gameState;

		this.storage.push(new GameBit({
										player: player, 
										key: key,
										value: value,
										state: state
		}));

		return true;
	};
	
	// Sorting Operation
	
	GameStorage.prototype.reverse = function () {
		return new GameStorage(this.game, this.options, this.storage.reverse());
	};
	
	/**
	 * Sort the game storage according to a certain criteria. 
	 * If not criteria is passed sort by player name.
	 * 
	 */
	GameStorage.prototype.sort = function(func) {
		var func = func || GameBit.comparePlayer;
		return new GameStorage(this.game, this.options, this.storage.sort(func));
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
	
	GameStorage.prototype.sortByValue = function(key) {
		
		if (!key) {
			return this.storage.sort(GameBit.compareValue);
		}
		else {			
			var func = GameBit.compareValueByKey(key);
			return this.storage.sort(func);
		}
	};
	
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
		return new GameStorage(this.game, this.options, out);		
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
	
	
	// TODO: users do not need to enter value. in case they want 
	// to access a property of the value obj
	GameStorage.prototype.select = function (key, op, value) {
		if (!key) return this;
		
		// Verify input 
		if ('undefined' !== typeof op) {
			if ('undefined' === typeof value) {
				node.log('Query error. Missing value for operator: ' + key + ' ' + op + ' (?)', 'WARN');
				return false;
			}
			
			if (!Utils.in_array(op, ['>','>=','>==','<', '<=', '<==', '!=', '!==', '=', '==', '==='])) {
				node.log('Query error. Invalid operator detected: ' + op, 'WARN');
				return false;
			}
			
			if (op === '=') op = '==';
			
		}
		else if ('undefined' !== typeof value) {
			node.log('Query error. Missing operator: ' + key + ' (?) ' + value , 'WARN');
			return false;
		}
		else {
			op = '';
			value = '';
		}
		
		// Define comparison function, state is a special case
		if (key === 'state') {
			var comparator = function (elem) {
				try {	
					if (Utils.eval(GameState.compare(elem.state, value) + op + 0,elem)) {
						return elem;
					}
				}
				catch(e) {
					console.log('Malformed select query: ' + key + op + value);
					return false;
				};
			};
		}
		else {
			var comparator = function (elem) {
				try {	
					if (Utils.eval('this.' + key + op + value, elem)) {
						return elem;
					}
				}
				catch(e) {
					console.log('Malformed select query: ' + key + op + value);
					return false;
				};
			}
		}
		
		return this.filter(comparator);
	};
	
	GameStorage.prototype.filter = function (func) {
		return new GameStorage(this.game, this.options, this.storage.filter(func));
	};
	
	// Get Values

	GameStorage.prototype.split = function () {

		var out = [];
		
		for (var i=0; i < this.storage.length; i++) {
			out = out.concat(new GameBit(this.storage[i]).split());
		}	
		
		//console.log(out);
		
		return new GameStorage(this.game, this.options, out);
	};
	
	
	GameStorage.prototype.groupBy = function (id) {
		if (!id) return this.storage;
		
		var groups = [];
		var outs = [];
		for (var i=0; i < this.storage.length; i++) {
			try {
				var el = Utils.eval('this.'+id, this.storage[i]);
			}
			catch(e) {
				console.log('Malformed id ' + id);
				return false;
			};
						
			if (!Utils.in_array(el,groups)) {
				groups.push(el);
				
				var out = this.filter(function (elem) {
					if (Utils.eval('this.'+id,elem) === el) {
						return this;
					}
				});
				
				outs.push(out);
			}
			
		}
		
		//console.log(groups);
		
		return outs;
	};
	
	GameStorage.prototype.join = function (key1, key2, newkey) {		
		return this._join(key1, key2, newkey, function(a,b) {return (a === b);});
	};
	
	GameStorage.prototype.concat = function (key1, key2, newkey) {		
		return this._join(key1, key2, newkey, function(){ return true;});
	};

	GameStorage.prototype._join = function (key1, key2, newkey, condition) {
		
		var out = [];
		for (var i=0; i < this.storage.length; i++) {
			try {
				var foreign_key = Utils.eval('this.'+key1, this.storage[i]);
				if ('undefined' !== typeof foreign_key) { 
					for (var j=0; j < this.storage.length; j++) {
						if (i === j) continue;
						try {
							var key = Utils.eval('this.'+key2, this.storage[j]);
							if ('undefined' !== typeof key) { 
								if (condition(foreign_key, key)) {
									out.push(GameBit.join(this.storage[i], this.storage[j], newkey));
								}
							}
						}
						catch(e) {
							console.log('Malformed key: ' + key2);
							//return false;
						}
					}
				}
			}
			catch(e) {
				console.log('Malformed key: ' + key1);
				//return false;
			}
		}
		
		return new GameStorage(this.game, this.options, out);
	};
	
	GameStorage.prototype.fetch = function (key,array) {
		
		switch (key) {
			case 'VALUES':
				var func = (array) ? GameBit.prototype.getValuesArray :
									 GameBit.prototype.getValues ;
				break;
			case 'KEY_VALUES':
				var func = (array) ? GameBit.prototype.getKeyValuesArray : 
									 GameBit.prototype.getKeyValues; 
				break;
			default:
				if (!array) return this.storage;
				var func = GameBit.prototype.toArray;
		}
		
		var out = [];	
		for (var i=0; i < this.storage.length; i++) {
			out.push(func.call(new GameBit(this.storage[i])));
		}	
		
		//console.log(out);
		return out;
	};
	
	GameStorage.prototype.fetchArray = function (key) {
		return this.fetch(key,true);
	};
	
	
	
	GameStorage.prototype.fetchValues = function () {
		return this.fetch('VALUES');
	};
	
	GameStorage.prototype.fetchKeyValues = function () {
		return this.fetch('KEY_VALUES');
	};
	
	GameStorage.prototype.fetchValuesArray = function () {
		return this.fetchArray('VALUES');
	};
	
	GameStorage.prototype.fetchKeyValuesArray = function () {
		return this.fetchArray('KEY_VALUES');
	};
	
	
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
		
	GameBit.prototype.join = function(gb, newkey) {
		return GameBit.join(this, gb, newkey);
	};
		
	GameBit.join = function(gb1, gb2, newkey) {
		var value = {};
		value[gb1.key] = gb1.value;
		value[gb2.key] = gb2.value;
		
		return new GameBit({player: gb1.player,
							state: gb1.state,
							key: newkey || gb1.key,
							value: value
		});
	};
	
	GameBit.prototype.split = function () {		
			
		
		if (!this.isComplex()) {
			return Utils.clone(this);;
		}
		
		var model = {};
		var out = [];
		
		if ('undefined' !== typeof this.player) {
			model.player = this.player;
		}
		
		if ('undefined' !== typeof this.state) {
			model.state = this.state;
		}
			
		if ('undefined' !== typeof this.key) {
			model.key = this.key;
		}
		
		var splitValue = function (value, model) {
			for (var i in value) {
				var copy = Utils.clone(model);
				copy.value = {};
				if (value.hasOwnProperty(i)) {
					if ('object' === typeof value[i]) {
						out = out.concat(splitValue(value[i], model));
					}
					else {
						copy.value[i] = value[i]; 
						out.push(copy);
					}
				}
			}
			return out;
		};
		
		return splitValue(this.value, model);
	};
	
	
	GameBit.prototype.getValues = function () {		
		return this.value;
	};
		
	GameBit.prototype.getKeyValues = function () {
		return {key: this.key, value: this.value};
	};
	
	GameBit.prototype.getValuesArray = function () {		
		return Utils.obj2KeyedArray(this.value);
	};
	
	GameBit.prototype.getKeyValuesArray = function () {
		return [this.key].concat(Utils.obj2KeyedArray(this.value));
	};
	
	
	GameBit.prototype.toArray = function () {
		
		var out = [];
		
		if ('undefined' !== typeof this.state) out.push(this.state);
		if ('undefined' !== typeof this.player) out.push(this.player);
		if ('undefined' !== typeof this.key) out.push(this.key);
		
		
		if (!this.isComplex()) {
			out.push(this.value);
		}
		else {
			out = out.concat(Utils.obj2KeyedArray(this.value));
		}
		
		return out;
	};
	
	
	
	GameBit.prototype.toString = function () {
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
	
	GameBit.compareValue = function (gb1, gb2) {
		if (gb1.value === gb2.value) return 0;
		// Sort alphabetically or by numerically ascending
		if (gb1.value > gb2.value) return 1;
		return -1;
	};	
	
	GameBit.compareValueByKey = function (key) {
	    return function (a,b) {
	        return (a.value[key] < b.value[key]) ? -1 : (a.value[key] > b.value[key]) ? 1 : 0;
	    }
	}

	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);

// @TODO check this comments

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


/** 
 *  Reverse the memory: instead of the history of a player for all rounds,
 *  we get the history of a round of all players
 */


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

