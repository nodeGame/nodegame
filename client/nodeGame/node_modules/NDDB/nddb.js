(function (exports, node) {
	
	/**
	 * 
	 * NDDB provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a new NDDB obj (can be concatenated):
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
	
	Utils = node.Utils;
	
	/**
	 * Expose constructors
	 */
	exports.NDDB = NDDB;
	
	
	/**
	 * NDDB interface
	 *
	 * @api public
	 */
	
	function NDDB (options, db) {
		
		// Default settings
		this.options = null;
		this.log = console.log;
		
		if (options) {
			this.options = options;
			this.log = options.log || this.log;
		}
	  
		this.D = {};		// The n-dimensional container for comparator functions
		this.db = db || [];	// The actual database
  		
	  

  		this.size = function() { return this.db.length };
	};
	
	NDDB.prototype.toString = function () {
		var out = '';
		for (var i=0; i< this.db.length; i++) {
			out += this.db[i] + '\n'
		}	
		return out;
	};	
		
	NDDB.prototype.set = function (d, comparator) {
		if (!d || !comparator) {
			this.log('Cannot set empty property or empty comparator');
			return false;
		}
		this.D[d] = comparator;
		return true;
	};

	NDDB.prototype.comparator = function (d) {
		return ('undefined' !== typeof this.D[d]) ? this.D[d] : function (o1, o2) {
//			console.log(o1);
//			console.log(o2);
			if (!o1 && !o2) return 0;
			if (!o1) return -1;
			if (!o2) return 1;
			if (!o1[d]) return -1;
			if (!o2[d]) return 1;
			if (o1[d] > o2[d]) return 1;
			if (o2[d] > o1[d]) return -1;
			return 0;
		};	
	};
	
	NDDB.prototype.insert = function (o) {
		this.db.push(o);
	};
	
	// Sorting Operation
	
	NDDB.prototype.reverse = function () {
		return new NDDB(this.options, this.db.reverse());
	};
	
	/**
	 * Sort the db according to a certain criteria. Criteria ca be a 
	 * comparator dimension or a custom function 
	 * 
	 * @param d
	 * 
	 */
	NDDB.prototype.sort = function (d) {
		
		if ('function' === typeof d) {
			var func = d;
		}
		else {
			var func = this.comparator(d);
		}
		
		return new NDDB(this.options, this.db.sort(func));
	};
	

	
	NDDB.prototype._analyzeQuery = function (d,op,value) {
		
		var raiseError = function (d,op,value) {
			var miss = '(?)';
			var err = 'Malformed query: ' + d || miss + ' ' + op || miss + ' ' + value || miss;
			this.log(err, 'WARN');
			return false;
		};
	
		if ('undefined' === typeof d) raiseError(d,op,value);
		
		// Verify input 
		if ('undefined' !== typeof op) {
			if ('undefined' === typeof value) {
				raiseError(d,op,value);
			}
			
			if (!Utils.in_array(op, ['>','>=','>==','<', '<=', '<==', '!=', '!==', '=', '==', '==='])) {
				this.log('Query error. Invalid operator detected: ' + op, 'WARN');
				return false;
			}
			
			if (op === '=') {
				op = '==';
			}
			// Encapsulating the value;
			o = {};
			o[d] = value;
			value = o;
		}
		else if ('undefined' !== typeof value) {
			raiseError(d,op,value);
		}
		else {
			op = '';
			value = '';
		}
		
		return {d:d,op:op,value:value};
	};
	
	// TODO: users do not need to enter value. in case they want 
	NDDB.prototype.select = function (d, op, value) {
	
		var valid = this._analyzeQuery(d, op, value);		
		if (!valid) return false;
		
		var d = valid.d;
		var op = valid.op;
		var value = valid.value;

		var comparator = this.comparator(d);
		
		//this.log(comparator.toString());
		//this.log(value);
		
		
		var func = function (elem) {
			try {	
				if (Utils.eval(comparator(elem, value) + op + 0, elem)) {
					return elem;
				}
			}
			catch(e) {
				console.log('Malformed select query: ' + d + op + value);
				return false;
			};
		};
	
		
		return this.filter(func);
	};
	
	NDDB.prototype.filter = function (func) {
		return new NDDB(this.options, this.db.filter(func));
	};
	
	// HERE
	
	NDDB.prototype.join = function (key1, key2, flag) {		
		return this._join(key1, key2, flag, Utils.equals);
	};
	
	NDDB.prototype.concat = function (key1, key2, flag) {		
		return this._join(key1, key2, flag, function(){ return true;});
	};

	NDDB.prototype._join = function (key1, key2, flag, comparator) {
		
		var out = [];
		for (var i=0; i < this.db.length; i++) {
			try {
				var foreign_key = Utils.eval('this.'+key1, this.db[i]);
				if ('undefined' !== typeof foreign_key) { 
					for (var j=0; j < this.db.length; j++) {
						if (i === j) continue;
						try {
							var key = Utils.eval('this.'+key2, this.db[j]);
							if ('undefined' !== typeof key) { 
								if (comparator(foreign_key, key)) {
									var o = Utils.merge(this.db[j], this.db[i]);
									if (flag) o[flag] = true;
									out.push(o);
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
		
		return new NDDB(this.options, out);
	};
	
	NDDB.prototype.fetch = function (key, array) {
		
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
				if (!array) return this.db;
				var func = GameBit.prototype.toArray;
		}
		
		var out = [];	
		for (var i=0; i < this.db.length; i++) {
			out.push(func.call(this.db[i]));
		}	
		
		//console.log(out);
		return out;
	};
	
	NDDB.prototype.fetchArray = function (key) {
		return this.fetch(key,true);
	};
	
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);



