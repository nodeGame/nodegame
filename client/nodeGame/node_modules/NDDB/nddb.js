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
	  this.options = options;
	  this.log = options.log || console.log;
	  
	  this.DB = db || [];
	  this.D = {};
	  

	  this.size = function() { return this.db.length };
	};
	
	NDDB._comparator = function (o1, o2) {
		if (!o1 && !o2) return 0;
		if (!o1) return -1;
		if (!o2) return 1;
		if (o1 > o2) return 1;
		if (o2 > o1) return -1;
		return 0;
	};
	
	NDDB.prototype.set = function (d, comparator) {
		this.D[d] = comparator || NDDB._comparator;
	};

	NDDB.prototype.comparator = function (d) {
		return ('undefined' !== this.D[d]) ? this.D[d] : NDDB._comparator;
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
			
			if (op === '=') op = '==';
			
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
		
		var comparator = this.comparator(d);
		
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
	
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);



