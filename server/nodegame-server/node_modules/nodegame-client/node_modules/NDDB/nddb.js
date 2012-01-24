(function (exports, JSUS) {
	
	/**
	 * 
	 * NDDB provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a this.create obj (can be concatenated):
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
	
	/**
	 * Expose constructors
	 */
	exports.NDDB = NDDB;
	
	// NDDB version
	NDDB.version = 0.2;
	
	// Stdout redirect
	NDDB.log = console.log;
	
	/**
	 * NDDB interface
	 *
	 * @api public
	 */
	
	function NDDB (options, db) {				
		// Default settings
		this.options = null;

		this.D = {};		// The n-dimensional container for comparator functions
		
		if (options) {
			this.options = options;
			NDDB.log = options.log || NDDB.log;
			this.D = options.D || this.D;
			if ('undefined' !== typeof options.parentDB) {
				this.parentDB = options.parentDB;
			}	
		}
	  		
		this.db = this.initDB(db);	// The actual database

	};
	
	NDDB.prototype.globalCompare = function(o1, o2) {
		console.log('NDDB COMPARE');
		if (!o1 && !o2) return 0;
		if (!o1) return -1;
		if (!o2) return 1;	
		if (o1.nddbid < o2.nddbid) return 1;
		if (o1.nddbid > o2.nddbid) return -1;
		return 0;
	};

	// TODO: Do we need this?
	// Can we set a length attribute
	// Count?
	NDDB.prototype.size = function() {
		return this.db.length 
	};
	
	NDDB.prototype.masquerade = function (o, db) {
		if (!o) return false;
		var db = db || this.db;
		o.__proto__ = JSUS.clone(o.__proto__);
		o.__proto__.nddbid = db.length;
		return o;
	};

	NDDB.prototype.initDB = function (db) {
		if (!db) return [];
		var out = [];
		for (var i = 0; i < db.length; i++) {
			out[i] = this.masquerade(db[i], out);
		}
		return out;
	};
	
	NDDB.prototype.create = function (db) {
		var options = this.cloneSettings();
		options.parentDB = this.db;
		//In case the class was inherited
		return new this.constructor(options, db);
	};
	
	NDDB.prototype.clear = function (confirm) {
		if (confirm) {
			this.db = [];
		}
		else {
			NDDB.log('Do you really want to clear the current dataset? Please use clear(true)', 'WARN');
		}
		
		return confirm;
	};	
	
	NDDB.prototype.cloneSettings = function () {
		if (!this.options) return {};
		var o = JSUS.clone(this.options);
		o.D = JSUS.clone(this.D);
		return o;
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
			NDDB.log('Cannot set empty property or empty comparator', 'ERR');
			return false;
		}
		this.D[d] = comparator;
		return true;
	};

	NDDB.prototype.comparator = function (d) {
		return ('undefined' !== typeof this.D[d]) ? this.D[d] : function (o1, o2) {
//			NDDB.log('1' + o1);
//			NDDB.log('2' + o2);
			if (!o1 && !o2) return 0;
			if (!o1) return -1;
			if (!o2) return 1;		
			var v1 = JSUS.getNestedValue(d,o1);
			var v2 = JSUS.getNestedValue(d,o2);
//			NDDB.log(v1);
//			NDDB.log(v2);
			if (!v1 && !v2) return 0;
			if (!v1) return -1;
			if (!v2) return 1;
			if (v1 > v2) return 1;
			if (v2 > v1) return -1;
			return 0;
		};	
	};
	
	NDDB.prototype.forEach = function (func, params) {
		for (var i=0; i< this.db.length; i++) {
			func.call(this, this.db[i], params);
		}
	};
	
	NDDB.prototype.map = function (func, params) {
		var out = [];
		for (var i=0; i< this.db.length; i++) {
			out.push(func.call(this, this.db[i], params));
		}
		return out;
	};

	
	NDDB.prototype.insert = function (o) {
		this.db.push(this.masquerade(o));
	};
	
	// Sorting Operation
	
	NDDB.prototype.reverse = function () {
		return this.create(this.db.reverse());
	};
	
//	/**
//	 * Sort the db according to a certain criteria. Criteria ca be a 
//	 * comparator dimension or a custom function 
//	 * 
//	 * @param d
//	 * 
//	 */
//	NDDB.prototype.sort = function (d) {
//		
//		if ('function' === typeof d) {
//			var func = d;
//		}
//		else {
//			var func = this.comparator(d);
//		}
//		
//		return this.create(this.cloneSettings(), this.db.sort(func));
//	};
	
	/**
	   * Sort the db according to a certain criteria. Criteria ca be a 
	   * comparator dimension or a custom function 
	   * 
	   * @param d
	   * 
	   */
	  NDDB.prototype.sort = function (d) {
		// GLOBAL compare  
	    if (!d) {
	    	var func = this.globalCompare;
	    }
	    
		// FUNCTION  
	    else if ('function' === typeof d) {
	      var func = d;
	    }
	    
	    // ARRAY of dimensions
	    else if (d instanceof Array) {
	      var that = this;
	      var func = function (a,b) {
	        for (var i=0; i < d.length; i++) {
	          var result = that.comparator(d[i]).call(that,a,b);
	          if (result !== 0) return result;
	        }
	        return result;
	      }
	    }
	    
	    // SINGLE dimension
	    else {
	      var func = this.comparator(d);
	    }
	    
	    return this.create(this.db.sort(func));
	  };

	  NDDB.prototype.delete = function () {
		  if (this.db.length === 0) return this;
		  if (this.parentDB) {
			  for (var i=0; i < this.db.length; i++) {
				  var idx = this.db[i].__proto__.nddbid - i;
				  this.parentDB.splice(idx,1);
			  };
			  // TODO: we could make it with only one for loop
			  // we loop on parent db and check whether the id is in the array
			  // at the same time we decrement the nddbid depending on i
			  for (var i=0; i < this.parentDB.length; i++) {
				  this.parentDB[i].__proto__.nddbid = i;
			  };
		  }
		  this.db = [];
		  return this;
	  };	
	
	  NDDB.prototype._analyzeQuery = function (d,op,value) {
		
		var raiseError = function (d,op,value) {
			var miss = '(?)';
			var err = 'Malformed query: ' + d || miss + ' ' + op || miss + ' ' + value || miss;
			NDDB.log(err, 'WARN');
			return false;
		};
		
	
		if ('undefined' === typeof d) raiseError(d,op,value);
		
		// Verify input 
		if ('undefined' !== typeof op) {
			if ('undefined' === typeof value) {
				raiseError(d,op,value);
			}
			
			if (!JSUS.in_array(op, ['>','>=','>==','<', '<=', '<==', '!=', '!==', '=', '==', '===', '><', '<>', 'in', '!in'])) {
				NDDB.log('Query error. Invalid operator detected: ' + op, 'WARN');
				return false;
			}
			
			if (op === '=') {
				op = '==';
			}
			
			// Range-queries need an array as third parameter
			if (JSUS.in_array(op,['><', '<>', 'in', '!in'])) {
				if (!(value instanceof Array)) {
					NDDB.log('Range-queries need an array as third parameter', 'WARN');
					raiseError(d,op,value);
				}
				if (op === '<>' || op === '><') {
					
					value[0] = JSUS.setNestedValue(d,value[0]);
					value[1] = JSUS.setNestedValue(d,value[1]);
				}
			}
			else {
				// Encapsulating the value;
				value = JSUS.setNestedValue(d,value);
			}
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
		
//		NDDB.log(comparator.toString());
//		NDDB.log(value);
		
		var exist = function (elem) {
			if ('undefined' !== typeof JSUS.getNestedValue(d,elem)) return elem;
		};
		
		var compare = function (elem) {
			try {	
//				console.log(elem);
//				console.log(value);
				if (JSUS.eval(comparator(elem, value) + op + 0, elem)) {
					return elem;
				}
			}
			catch(e) {
				NDDB.log('Malformed select query: ' + d + op + value);
				return false;
			};
		};
		
		var between = function (elem) {
			if (comparator(elem, value[0]) > 0 && comparator(elem, value[1]) < 0) {
				return elem;
			}
		};
		
		var notbetween = function (elem) {
			if (comparator(elem, value[0]) < 0 && comparator(elem, value[1] > 0)) {
				return elem;
			}
		};
		
		var inarray = function (elem) {
			if (JSUS.in_array(JSUS.getNestedValue(d,elem), value)) {
				return elem;
			}
		};
		
		var notinarray = function (elem) {
			if (!JSUS.in_array(JSUS.getNestedValue(d,elem), value)) {
				return elem;
			}
		};
		
		switch (op) {
			case (''): var func = exist; break;
			case ('<>'): var func = notbetween; break;
			case ('><'): var func = between; break;
			case ('in'): var func = inarray; break;
			case ('!in'): var func = notinarray; break;
			default: var func = compare;
		}
		
		return this.filter(func);
	};
	
	NDDB.prototype.filter = function (func) {
		return this.create(this.db.filter(func));
	};
	
	// TODO: check do we need to reassign __nddbid__ ?
	NDDB.prototype.shuffle = function () {
		this.db = JSUS.shuffle(this.db);
		return true;
	};
	
	
	// TODO: check do we need to reassign __nddbid__ ?
	NDDB.prototype.join = function (key1, key2, pos, select) {
		// Construct a better comparator function
		// than the generic JSUS.equals
//		if (key1 === key2 && 'undefined' !== typeof this.D[key1]) {
//			var comparator = function(o1,o2) {
//				if (this.D[key1](o1,o2) === 0) return true;
//				return false;
//			}
//		}
//		else {
//			var comparator = JSUS.equals;
//		}
		return this._join(key1, key2, JSUS.equals, pos, select);
	};
	
	NDDB.prototype.concat = function (key1, key2, pos) {		
		return this._join(key1, key2, function(){ return true;}, pos);
	};

	NDDB.prototype._join = function (key1, key2, comparator, pos, select) {
		var pos = ('undefined' !== typeof pos) ? pos : 'joined';
		var out = [];
		var idxs = [];
		for (var i=0; i < this.db.length; i++) {
			try {
				var foreign_key = JSUS.eval('this.'+key1, this.db[i]);
				if ('undefined' !== typeof foreign_key) { 
					// TODO: check if this is correct for left join
					for (var j=i+1; j < this.db.length; j++) {
						//if (i === j) continue;
						try {
							var key = JSUS.eval('this.'+key2, this.db[j]);
							if ('undefined' !== typeof key) { 
								if (comparator(foreign_key, key)) {
									// Inject the matched obj into the
									// reference one
									var o = JSUS.clone(this.db[i]);
									var o2 = (select) ? JSUS.subobj(this.db[j], select) : this.db[j];
									o[pos] = o2;
									out.push(o);
								}
							}
						}
						catch(e) {
							NDDB.log('Malformed key: ' + key2);
							//return false;
						}
					}
				}
			}
			catch(e) {
				NDDB.log('Malformed key: ' + key1);
				//return false;
			}
		}
		
		return this.create(out);
	};
	
	
	NDDB._getValues = function (o, key) {		
		return JSUS.eval('this.' + key, o);
	};
	
	NDDB._getValuesArray = function (o, key) {		
		return JSUS.obj2KeyedArray(JSUS.eval('this.' + key, o));
	};
	
	NDDB._getKeyValuesArray = function (o, key) {
		return [key].concat(JSUS.obj2KeyedArray(JSUS.eval('this.' + key, o)));
	};
	
	NDDB.prototype.fetch = function (key, array) {
		
//		NDDB.log(key);
//		NDDB.log(array);
		
		switch (array) {
			case 'VALUES':
				var func = (key) ? NDDB._getValuesArray : 
								   JSUS.obj2Array;
				
				break;
			case 'KEY_VALUES':
				var func = (key) ? NDDB._getKeyValuesArray :
								   JSUS.obj2KeyedArray;
				break;
				
			default: // results are not 
				if (!key)  return this.db;
				var func = NDDB._getValues;  	  
		}
		
		var out = [];	
		for (var i=0; i < this.db.length; i++) {
			out.push(func.call(this.db[i], this.db[i], key));
		}	
		
		//NDDB.log(out);
		return out;
	};
	
	NDDB.prototype.fetchValues = function (key) {
		return this.fetch(key, 'VALUES');
	};
	
	NDDB.prototype.fetchKeyValues = function (key) {
		return this.fetch(key, 'KEY_VALUES');
	};
		
	NDDB.prototype.first = function (key) {
		return this.fetch(key)[0];
	};
	
	NDDB.prototype.last = function (key) {
		var db = this.fetch(key);
		return (db.length > 0) ? db[db.length-1] : undefined;
	};
	
	NDDB.prototype.limit = function (limit) {
		if (limit === 0) return this.create();
		var db = (limit > 0) ? this.db.slice(0, limit) :
							   this.db.slice(limit);
		
		return this.create(db);
	};
	
	NDDB.prototype._split = function (o, key) {		
				
		if ('object' !== typeof o[key]) {
			return JSUS.clone(o);;
		}
		
		var out = [];
		var model = JSUS.clone(o);
		model[key] = {};
		
		var splitValue = function (value) {
			for (var i in value) {
				var copy = JSUS.clone(model);
				if (value.hasOwnProperty(i)) {
					if ('object' === typeof value[i]) {
						out = out.concat(splitValue(value[i]));
					}
					else {
						copy[key][i] = value[i]; 
						out.push(copy);
					}
				}
			}
			return out;
		};
		
		return splitValue(o[key]);
	};
	
	NDDB.prototype.split = function (key) {	
		var out = [];
		for (var i=0; i<this.db.length;i++) {
			out = out.concat(this._split(this.db[i], key));
		}
		return this.create(out);
	};
	
	NDDB.prototype.count = function (key) {
		if ('undefined' === typeof key) return this.db.length;
		var count = 0;
		for (var i=0; i < this.db.length; i++) {
			try {
				var tmp = JSUS.eval('this.' + key, this.db[i]);
				if ('undefined' !== typeof tmp) {
					count++;
				}
			}
			catch (e) {};
		}	
		return count;
	};
	
	NDDB.prototype.sum = function (key) {
		var sum = 0;
		for (var i=0; i < this.db.length; i++) {
			try {
				var tmp = JSUS.eval('this.' + key, this.db[i]);
				if (!isNaN(tmp)) {
					sum += tmp;
				}
			}
			catch (e) {};
		}	
		return sum;
	};
	
	NDDB.prototype.mean = function (key) {
		var sum = 0;
		var count = 0;
		for (var i=0; i < this.db.length; i++) {
			try {
				var tmp = JSUS.eval('this.' + key, this.db[i]);
				if (!isNaN(tmp)) { 
					//NDDB.log(tmp);
					sum += tmp;
					count++;
				}
			}
			catch (e) {};
		}	
		return (count === 0) ? 0 : sum / count;
	};
	
	NDDB.prototype.min = function (key) {
		var min = false;
		for (var i=0; i < this.db.length; i++) {
			try {
				var tmp = JSUS.eval('this.' + key, this.db[i]);
				if (!isNaN(tmp) && (tmp < min || min === false)) {
					min = tmp;
				}
			}
			catch (e) {};
		}	
		return min;
	};

	NDDB.prototype.max = function (key) {
		var max = false;
		for (var i=0; i < this.db.length; i++) {
			try {
				var tmp = JSUS.eval('this.' + key, this.db[i]);
				if (!isNaN(tmp) && (tmp > max || max === false)) {
					max = tmp;
				}
			}
			catch (e) {};
		}	
		return max;
	};
	
	NDDB.prototype.groupBy = function (key) {
		if (!key) return this.db;
		
		var groups = [];
		var outs = [];
		for (var i=0; i < this.db.length; i++) {
			try {
				var el = JSUS.eval('this.' + key, this.db[i]);
			}
			catch(e) {
				NDDB.log('groupBy malformed key: ' + key, 'ERR');
				return false;
			};
						
			if (!JSUS.in_array(el,groups)) {
				groups.push(el);
				
				var out = this.filter(function (elem) {
					if (JSUS.equals(JSUS.eval('this.' + key, elem),el)) {
						return this;
					}
				});
				
				outs.push(out);
			}
			
		}
		
		//NDDB.log(groups);
		
		return outs;
	};	
	
	/**
	 * Performs a diff with the database obj passed as parameter.
	 * Returns all the element of the database which are not present in the
	 * database obj passed as parameter.
	 * If the 'key' parameter
	 */
	NDDB.prototype.diff = function (nddb) {
		if ('object' === typeof nddb) {
			if (nddb instanceof NDDB || nddb instanceof this.constructor) {
				var nddb = nddb.db;
			}
		}
		if (nddb.length === 0) return this;
		var that = this;
		return this.filter(function(el){
			for (var i=0; i < nddb.length; i++) {
				if (that.globalCompare(el,nddb[i]) != 0) {
					return el;
				}
			}
		});
	};
	
	/**
	 * Performs a diff with the database obj passed as parameter.
	 * Returns all the element of the database which are not present in the
	 * database obj passed as parameter.
	 * If the 'key' parameter
	 */
	NDDB.prototype.intersect = function (nddb) {
		if ('object' === typeof nddb) {
			if (nddb instanceof NDDB || nddb instanceof this.constructor) {
				var nddb = nddb.db;
			}
		}
		var that = this;
		return this.filter(function(el){
			for (var i=0; i < nddb.length; i++) {
				if (that.globalCompare(el,nddb[i]) === 0) {
					return el;
				}
			}
		});
	};
	
})(
		
	'undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window
  , 'undefined' != typeof JSUS ? JSUS : module.parent.exports.JSUS
);
