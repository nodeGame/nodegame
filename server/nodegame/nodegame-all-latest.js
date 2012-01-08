/*!
 * nodeGame-all v0.6.5
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Sun Jan 8 15:30:54 CET 2012
 *
 */
 
 
/*!
 * nodeGame Client v0.6.5
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Sun Jan 8 15:30:54 CET 2012
 *
 */
 
 
(function (exports) {
	
	var JSUS = exports.JSUS = {};
	
	JSUS.extend = function (additional, target) {		
		if (!additional) return target;
		
//		console.log('A');
//		console.log(additional);
//		
//		console.log('T');
//		console.log(target);
//		
		
		var target = target || this; 
		
	    for (var prop in additional) {
	      if (additional.hasOwnProperty(prop)) {
	        if (typeof target[prop] !== 'object') {
	        	target[prop] = additional[prop];
	        } else {
	          JSUS.extend(additional[prop], target[prop]);
	        }
	      }
	    }

	    // additional is a class (Function)
	    // TODO: this is true also for {}
	    if (additional.prototype) {
	    	JSUS.extend(additional.prototype, target.prototype || target);
	    };
		
	    
	    return target;
	  };

    // if node
	if ('object' === typeof module && 'function' === typeof require) {
	    require('./lib/obj');
		require('./lib/array');
	    require('./lib/time');
	    require('./lib/eval');
	    require('./lib/dom');
	}
	// end node

})('undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window); 
 
(function (JSUS) {

	
	
	function OBJ(){};

	
    OBJ.equals = function (o1, o2) {
    	
        if (!o1 || !o2) return false;
      	
    	// Check whether arguments are not objects
    	if ( typeof o1 in {number:'',string:''}) {
    		if ( typeof o2 in {number:'',string:''}) {
        		return (o1 === o2);
        	}
    		return false;
    	}
    	else if ( typeof o2 in {number:'',string:''}) {
    		return false;
    	}
    	

  	  
      for (var p in o1) {
          if (o1.hasOwnProperty(p)) {
        	  
        	  if ('undefined' === typeof o2[p] && 'undefined' !== typeof o1[p]) return false;
        	  
        	  switch (typeof o1[p]) {
                  case 'object':
                      if (!OBJ.equals(o1[p],o2[p])) return false;
                    	
                  case 'function':
                      if (o1[p].toString() !== o2[p].toString()) return false;
                    	
                  default:
                      if (o1[p] !== o2[p]) return false; 
              }
          } 
      }

      
      // Check whether o2 has extra properties
      // TODO: improve, some properties have already been checked!
      for (p in o2) {
    	  if (o2.hasOwnProperty(p)) {
    		  if ('undefined' === typeof o1[p] && 'undefined' !== typeof o2[p])
    			  return false;
    	  }
      }

      return true;
    };
	
	OBJ.getListSize = function (list) {	
		var n = 0;
		for (var key in list) {
		    if (list.hasOwnProperty(key)) {
		    	n++;
		    }
		}
		
		//console.log('Calculated list length ' + n);
		
		return n;
	};
	
	
	
	OBJ._obj2Array = function(obj, keyed) {
	    var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	    	   if ( 'object' === typeof obj[key] ) {
					result = result.concat(OBJ._obj2Array(obj[key],keyed));
				}
				else {
					if (keyed) result.push(key);
			        result.push(obj[key]);
				}
	    	   
	       }
	    }
	  
	    return result;
	};
	
	OBJ.obj2Array = function (obj) {
	    return OBJ._obj2Array(obj);
	};
	
	/**
	 * Creates an array containing all keys and values of the obj.
	 */
	OBJ.obj2KeyedArray = function (obj) {
	    return OBJ._obj2Array(obj,true);
	};
	
	OBJ.objGetAllKeys = function (obj) {
		var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	    	   result.push(key);
	    	   if ('object' === typeof obj[key]) {
	    		   result = result.concat(OBJ.objGetAllKeys(obj[key]));
	    	   }
	       }
	    }
	    return result;
	};
	

	
	/**
	 * Creates an array of key:value objects.
	 * 
	 */
	OBJ.implodeObj = function (obj) {
		//console.log(obj);
	    var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	    	   var o = {};
	    	   o[key] = obj[key];
	           result.push(o);
	           //console.log(o);
	       }
	    }
	    return result;
	};
	
	

	
	
	/**
	 * Creates a perfect copy of the obj
	 */
	OBJ.clone = function (obj) {
		if (!obj) return;
		var clone = {};
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				if ( 'object' === typeof obj[i] ) {
					clone[i] = OBJ.clone(obj[i]);
				}
				else {
					clone[i] = obj[i];
				}
			}
		}
		return clone;
	};
	
	/**
	 * Performs a left join on the keys of two objects. In case keys overlaps
	 *  the values from obj2 are taken.
	 */
	OBJ.join = function (obj1, obj2) {
		var clone = OBJ.clone(obj1);
		if (!obj2) return clone;
		for (var i in clone) {
			if (clone.hasOwnProperty(i)) {
				if ('undefined' !== typeof obj2[i]) {
					if ( 'object' === typeof obj2[i] ) {
						clone[i] = OBJ.join(clone[i], obj2[i]);
					}
					else {
						clone[i] = obj2[i];
					}
				}
			}
		}
		return clone;
	};
	
	/**
	 * Merges two objects in one. In case keys overlaps the values from 
	 * obj2 are taken.
	 */
	OBJ.merge = function (obj1, obj2) {
		var clone = OBJ.clone(obj1);
//		console.log('CLONE');
//		console.log(clone);
		if (!obj2) return clone;
		for (var i in obj2) {
			if (obj2.hasOwnProperty(i)) {
				//console.log(i);
				if ( 'object' === typeof obj2[i] ) {
					clone[i] = OBJ.merge(obj1[i],obj2[i]);
				}
				else {
					clone[i] = obj2[i];
				}
			}
		}
		return clone;
	};
	
	/**
	 * Set the.
	 */
	OBJ.mergeOnKey = function (obj1, obj2, key) {
		var clone = OBJ.clone(obj1);
		if (!obj2 || !key) return clone;		
		for (var i in obj2) {
			if (obj2.hasOwnProperty(i)) {
				if ( 'object' === typeof obj1[i] ) {
					clone[i][key] = obj2[i];
				}
			}
		}
		return clone;
	};
	
	OBJ.subobj = function (o, select) {
		if (!o) return false;
		var out = {};
		if (!select) return out;
		for (var i=0; i<select.length;i++) {
			var key = select[i];
			//console.log(key);
			if ('undefined' !== o[key]) {
				out[key] = o[key];
			}
		}
		return out;
	};
	
	OBJ.mergeOnValue = function (obj1, obj2) {
		return OBJ.mergeOnKey(obj1, obj2, 'value');
	};
	
	OBJ.setNestedValue = function (str, value, obj) {
		var obj = obj || {};
		var keys = str.split('.');
		if (keys.length === 1) {
			obj[str] = value;
			return obj;
		}
		var k = keys.shift();
		obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]); 
		return obj;
	};
	
	OBJ.getNestedValue = function (str, obj) {
		if (!obj) return;
		var keys = str.split('.');
		if (keys.length === 1) {
			return obj[str];
		}
		var k = keys.shift();
		return OBJ.getNestedValue(keys.join('.'), obj[k]); 
	};

	JSUS.extend(OBJ);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS); 
 
(function (JSUS) {
	
	function ARRAY(){};
	
	
	// ARRAYs
	/////////
	
	// Add the filter method to ARRAY objects in case the method is not
	// supported natively. 
	// See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/ARRAY/filter#Compatibility
	
    if (!Array.prototype.filter) {  
      Array.prototype.filter = function(fun /*, thisp */) {  
        "use strict";  
        if (this === void 0 || this === null) throw new TypeError();  
      
        var t = Object(this);  
        var len = t.length >>> 0;  
        if (typeof fun !== "function") throw new TypeError();  
        
        var res = [];  
        var thisp = arguments[1];  
        for (var i = 0; i < len; i++) {  
          if (i in t) {  
            var val = t[i]; // in case fun mutates this  
            if (fun.call(thisp, val, i, t)) { 
              res.push(val);  
            }
          }  
        }  
      
        return res;  
      };  
    }  
    
    ARRAY.removeElement = function (needle, haystack) {
    	
//    	console.log('needle');
//    	console.log(needle);
//    	console.log('haystack');
//    	console.log(haystack);
    	
    	if ('object' === typeof needle) {
        	  var func = JSUS.equals;
	      }
	      else {
	    	  var func = function (a,b) {
	    		  return (a === b);
	    	  }
	      }
    	
    	
    	for (var i=0; i < haystack.length; i++) {
      	    if (func(needle, haystack[i])){
//      	    	console.log('hays');
//      	    	console.log(haystack);
      	    	return haystack.splice(i,1);
      	    }
      	}
    	
      	return false;
    	
    };
    
    
    ARRAY.in_array = function (needle, haystack){
  	  
        if ('object' === typeof needle) {
      	  var func = JSUS.equals;
        }
        else {
      	  var func = function (a,b) {
      		  return (a === b);
      	  }
        }
        
        
  	  for(var i=0;i<haystack.length;i++){
  	    if (func.call(this,needle,haystack[i])) return true;
  	  }
  	  return false;
    };
    
    /**
	 * Returns an array of N array containing the same number of elements
	 * The last group could have less elements.
	 * 
	 */ 
	ARRAY.getNGroups = function (array, N) {
		return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
	};
	
	/**
	 * Returns an array of array containing N elements each
	 * The last group could have less elements.
	 * 
	 */ 
	ARRAY.getGroupsSizeN = function (array, N) {
		
		var copy = array.slice(0);
		var len = copy.length;
		var originalLen = copy.length;
		var result = [];
		
		// Init values for the loop algorithm
		var i;
		var idx;
		var group = [];
		var count = 0;
		for (i=0; i < originalLen; i++) {
			
			// Get a random idx between 0 and array length
			idx = Math.floor(Math.random()*len);
			
			// Prepare the array container for the elements of a new group
			if (count >= N) {
				result.push(group);
				count = 0;
				group = [];
			}
			
			// Insert element in the group
			group.push(copy[idx]);
			
			// Update
			copy.splice(idx,1);
			len = copy.length;
			count++;
		}
		
		// Add any remaining element
		if (group.length > 0) {
			result.push(group);
		}
		
		return result;
	};
	
	/**
	 * Match each element of the array with N random others.
	 * If strict is equal to true, elements cannot be matched multiple times.
	 */
	ARRAY.matchN = function (array, N, strict) {
		console.log('TO MATCH');
		console.log(array.length);
		
		var result = []
		var len = array.length;
		var found = [];
		for (var i = 0 ; i < len ; i++) {
			// Recreate the array
			var copy = array.slice(0);
			copy.splice(i,1);
			if (strict) {
				copy = ARRAY.arrayDiff(copy,found);
			}
			var group = ARRAY.getNRandom(copy,N);
			// Add to the set of used elements
			found = found.concat(group);
			// Re-add the current element
			group.splice(0,0,array[i]);
			result.push(group);
			
			//Update
			group = [];
			
		}
		return result;
	};
	
	ARRAY.arraySelfConcat = function(array) {
		var i = 0;
		var len = array.length;
		var result = []
		for (;i<len;i++) {
			result = result.concat(array[i]);
		}
		return result;
	};
	
	
	/**
	 * Performs a diff between two arrays. 
	 * Returns all the values of the first array which are not present 
	 * in the second one.
	 */
	ARRAY.arrayDiff = function(a1, a2) {
		return a1.filter( function(i) {
			return !(a2.indexOf(i) > -1);
		});
	};
	
	/**
	 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	 * 
	 */
	ARRAY.shuffle = function (array, N, callback) {
		var copy = array.slice(0);
		var len = array.length-1; // ! -1
		for (var i = len; i > 0; i--) {
			var j = Math.floor(Math.random()*(i+1));
			var tmp = copy[j];
			copy[j] = copy[i];
			copy[i] = tmp;
			//console.log(copy);
		}
		return copy;
	};
	
	ARRAY.getNRandom = function (array, N, callback) {
		return ARRAY.shuffle(array).slice(0,N);
	};                           
	                           	
	ARRAY.generateCombinations = function (array, r, callback) {
	    function equal(a, b) {
	        for (var i = 0; i < a.length; i++) {
	            if (a[i] != b[i]) return false;
	        }
	        return true;
	    }
	    function values(i, a) {
	        var ret = [];
	        for (var j = 0; j < i.length; j++) ret.push(a[i[j]]);
	        return ret;
	    }
	    var n = array.length;
	    var indices = [];
	    for (var i = 0; i < r; i++) indices.push(i);
	    var final = [];
	    for (var i = n - r; i < n; i++) final.push(i);
	    while (!equal(indices, final)) {
	        callback(values(indices, array));
	        var i = r - 1;
	        while (indices[i] == n - r + i) i -= 1;
	        indices[i] += 1;
	        for (var j = i + 1; j < r; j++) indices[j] = indices[i] + j - i;
	    }
	    callback(values(indices, array));
	};
    
	//TODO: Improve
	ARRAY.print_r = function (array) {
		for (var i=0,len=array.length;i<len;i++){
			var el = array[i]; 
			if (typeof(el) === 'ARRAY'){
				ARRAY.print_r(el);
			}
			else {
				if (typeof(el) === 'Object'){
					for (var key in el) {
						if (el.hasOwnProperty(key)){
							console.log(key + ' ->\n');
							ARRAY.print_r(el[key]);
						}
					}
				}
				else {
					console.log(el);
				}
			}
		}
	};
	
	JSUS.extend(ARRAY);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS); 
 
(function (JSUS) {
	
	function TIME() {};

    TIME.getDate = function() {
		var d = new Date();
		var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
				+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
				+ d.getMilliseconds();
		
		return date;
	};
	
	TIME.getTime = function() {
		var d = new Date();
		var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
		
		return time;
	};
	
	/**
	 * Returns an array days, minutes, seconds, mi
	 * @param ms time in milliseconds
	 * @return array 
	 */
	TIME.parseMilliseconds = function (ms) {
	  
		var result = [];
		var x = ms / 1000;
		result[4] = x;
		var seconds = x % 60;
		result[3] = Math.floor(seconds);
		var x = x /60;
		var minutes = x % 60;
		result[2] = Math.floor(minutes);
		var x = x / 60;
		var hours = x % 24;
		result[1] = Math.floor(hours);
		var x = x / 24;
		var days = x;
		result[1] = Math.floor(days);
		
	    return result;
	};
	
	JSUS.extend(TIME);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS); 
 
(function (JSUS) {
	
	function EVAL(){};

	EVAL.eval = function (str, context) {
    	// Eval must be called indirectly
    	// i.e. eval.call is not possible
    	//console.log(str);
    	var func = function (str) {
    		// TODO: Filter str
    		return eval(str);
    	}
    	return func.call(context, str);
    };
    
    JSUS.extend(EVAL);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS); 
 
(function (JSUS) {
	
	function DOM(){};

	//Returns true if it is a DOM node
	DOM.isNode = function(o){
	  return (
	    typeof Node === "object" ? o instanceof Node : 
	    typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	  );
	}
	
	//Returns true if it is a DOM element    
	DOM.isElement = function(o) {
	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
	  );
	}

//	DOM.findLastElement = function(o) {
//		if (!o) return;
//		
//		if (o.lastChild) {
//			var e 
//			JSUS.isElement(e)) return DOM.findLastElement(e);
//		
//			var e = e.previousSibling;
//			if (e && JSUS.isElement(e)) return DOM.findLastElement(e);
//		
//		return o;
//	};
	
	JSUS.extend(DOM);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS); 
 
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
		}
	  		
		this.db = db || [];	// The actual database

  		this.size = function() { return this.db.length };
	};
	
	NDDB.prototype.create = function (options, db) {
		//In case the class was inherited
		return new this.constructor(options, db);
	};
	
	NDDB.prototype.clear = function (confirm) {
		if (confirm) {
			this.db = [];
		}
		else {
			NDDB.log('Do you really want to delete all the records? Please use clear(true)', 'WARN');
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
	
	NDDB.prototype.forEach = function(func, params) {
		for (var i=0; i< this.db.length; i++) {
			func.call(this, this.db[i], params);
		}
	};
	
	NDDB.prototype.insert = function (o) {
		this.db.push(o);
	};
	
	// Sorting Operation
	
	NDDB.prototype.reverse = function () {
		return this.create(this.cloneSettings(), this.db.reverse());
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
	    
		// FUNCTION  
	    if ('function' === typeof d) {
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
	    
	    return this.create(this.cloneSettings(), this.db.sort(func));
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
		return this.create(this.cloneSettings(), this.db.filter(func));
	};
	
	// HERE
	
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
		
		return this.create(this.cloneSettings(), out);
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
		if (limit === 0) return this.create(this.cloneSettings());
		var db = (limit > 0) ? this.db.slice(0, limit) :
							   this.db.slice(limit);
		
		return this.create(this.cloneSettings(), db);
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
		return this.create(this.cloneSettings(), out);
	};
	
	NDDB.prototype.count = function (key) {
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
	
})(
		
	'undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window
  , 'undefined' != typeof JSUS ? JSUS : module.parent.exports.JSUS
); 
 
(function (exports) {
	
   /**
    * Expose constructor.
    */
	exports.EventEmitter = EventEmitter;
	
	//var parser = exports.parser = {};
		 
	function EventEmitter() {
	    this._listeners = {};
	    this._localListeners = {};
	}
	
	EventEmitter.prototype = {
	
	    constructor: EventEmitter,
		
	    addListener: function (type, listener) {
	    	 if (typeof this._listeners[type] == "undefined"){
	             this._listeners[type] = [];
	         }
	         //console.log('Added Listener: ' + type + ' ' + listener);
	         this._listeners[type].push(listener);
	    },
	    
	    addLocalListener: function (type, listener) {
	    	if (typeof this._localListeners[type] == "undefined"){
	            this._localListeners[type] = [];
	        }
	
	        this._localListeners[type].push(listener);
	    },
	
	    emit: function(event, p1, p2, p3) { // Up to 3 parameters
	    	
	    	if (typeof event == "string") {
	            event = { type: event };
	        }
	        if (!event.target){
	            event.target = this;
	        }
	        
	        if (!event.type){  //falsy
	            throw new Error("Event object missing 'type' property.");
	        }
	    	// Debug
	        //console.log('Fired ' + event.type);
	        
	        
	        //Global Listeners
	        if (this._listeners[event.type] instanceof Array) {
	            var listeners = this._listeners[event.type];
	            for (var i=0, len=listeners.length; i < len; i++){
	            	listeners[i].call(this.game, p1, p2, p3);
	            }
	        }
	        
	        // Local Listeners
	        if (this._localListeners[event.type] instanceof Array) {
	            var listeners = this._localListeners[event.type];
	            for (var i=0, len=listeners.length; i < len; i++) {
	            	listeners[i].call(this.game, p1, p2, p3);
	            }
	        }
	       
	    },
	    
	    // TODO: remove fire when all the code has been updated
//	    fire: function(event, p1, p2, p3) { // Up to 3 parameters
//	    	this.emit(event, p1, p2, p3);
//	    },
	
	    removeListener: function(type, listener) {
	
	    	function removeFromList(type, listener, list) {
		    	//console.log('Trying to remove ' + type + ' ' + listener);
		    	
		        if (list[type] instanceof Array) {
		        	
		        	if (listener === null || listener === undefined) {
		        		delete list[type];
		        		//console.log('Removed listener ' + type);
		        		return true;
		        	}
		        	
		            var listeners = list[type];
		            for (var i=0, len=listeners.length; i < len; i++) {
		            	
		            	//console.log(listeners[i]);
		            	
		                if (listeners[i] === listener){
		                    listeners.splice(i, 1);
		                    //console.log('Removed listener ' + type + ' ' + listener);
		                    return true;
		                }
		            }
		        }
		        
		        return false; // no listener removed
	    	}
	    	
	    	var r1 = removeFromList(type, listener, this._listeners);
	    	var r2 = removeFromList(type, listener, this._localListeners);

	    	return r1 || r2;
	    },
	    
	    clearLocalListeners: function() {
	    	//console.log('Cleaning Local Listeners');
	    	for (var key in this._localListeners) {
	    		if (this._localListeners.hasOwnProperty(key)) {
	    			this.removeListener(key, this._localListeners[key]);
	    		}
	    	}
	    	
	    	this._localListeners = {};
	    },
	    
	    // Debug
	    printAllListeners: function() {
	    	console.log('nodeGame:\tPRINTING ALL LISTENERS');
		    
	    	for (var i in this._listeners){
		    	if (this._listeners.hasOwnProperty(i)){
		    		console.log(i + ' ' + i.length);
		    	}
		    }
	    	
	    	for (var i in this._localListeners){
		    	if (this._listeners.hasOwnProperty(i)){
		    		console.log(i + ' ' + i.length);
		    	}
		    }
	        
	    }
	};

})('object' === typeof module ? module.exports : (window.node = {}));
 
 
(function (exports, node) {
	
	// TODO: check whether we still need a util class for nodegame
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.Utils = ('undefined' !== typeof JSUS) ? JSUS : node.JSUS;

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
 
 
(function (exports) {
	
	/*
	 * GameState
	 * 
	 * Representation of a state of the game
	 * 
	 */
	
	/**
	 * Expose constructor
	 */
	
	exports.GameState = GameState;
	
	GameState.iss = {};

	GameState.iss.UNKNOWN = 0; 		// Game has not been initialized
	GameState.iss.LOADING = 10;		// The game is loading
	GameState.iss.LOADED  = 25;		// Game is loaded, but the GameWindow could still require some time
	GameState.iss.PLAYING = 50;		// Everything is ready
	GameState.iss.DONE = 100;		// The player completed the game state
	
	function GameState (gs) {
		
		// TODO: The check for gs is done many times. Change it.
		if (gs) {
			this.state = 	gs.state;
			this.step = 	gs.step;
			this.round = 	gs.round;
			this.is = 		(gs.is) ? gs.is : GameState.iss.UNKNOWN;
			this.paused = 	(gs.paused) ? gs.paused : false;
		}
		else {
			this.state = 	0;
			this.step = 	0;
			this.round = 	0;
			this.is = 		GameState.iss.UNKNOWN;
			this.paused = 	false;
		}
	}
	
	GameState.prototype.toString = function () {
		var out = this.state + '.' + this.step + ':' + this.round + '_' + this.is;
		
		if (this.paused) {
			out += ' (P)';
		}
		return out;
	};
	
	// Compares two GameStates. 
	// If they are equal returns 0,
	// If gm1 is more ahead returns 1, vicersa -1;
	// If strict is set, also the is property is compared
	GameState.compare = function (gs1, gs2, strict) {
		var strict = strict || false;
//		console.log('COMPARAING GSs','DEBUG')
//		console.log(gs1,'DEBUG');
//		console.log(gs2,'DEBUG');
		var result = gs1.state - gs2.state;
		
		if (result === 0 && 'undefined' !== typeof gs1.round) {
			result = gs1.round - gs2.round;
			
			if (result === 0 && 'undefined' !== typeof gs1.step) {
				result = gs1.step - gs2.step;
				
				if (strict && result === 0 && 'undefined' !== typeof gs1.is) {
					result = gs1.is - gs2.is;
				}
			}
		}
//		console.log('EQUAL? ' + result);
		
		return result;
	};
	
	GameState.stringify = function (gs) {
		return gs.state + '.' + gs.step + ':' + gs.round + '_' + gs.is;
	}; 

})('undefined' != typeof node ? node : module.exports); 
 
(function (exports, node) {
	
	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/*
	 * Holds information about the list of players.
	 *
	 */
	
	/**
	 * Expose constructor
	 */
	exports.PlayerList = PlayerList;
	
	function PlayerList(list) {
		
		this.pl = list || {};
		
		this.size = function() {
			return Utils.getListSize(this.pl);
		};
				
	//	console.log('This is the size ' + this.size());
	
	}
	
	exports.PlayerList.prototype.importIDS = function(arrayIDS) {
	
		var PREFIX = 'P_';
		var i = this.size();
		var j = 0;
		for (;j<arrayIDS.length;j++){
			this.add(arrayIDS[j],'P_' + ++i);
		}
	};
		
	PlayerList.prototype.addPlayer = function (player) {
		if (!player) return false;
		return this.add(player.id, player.name);
	};
	
	PlayerList.prototype.add = function (pid,name) {	
		// Check if the id is unique
		if (!this.exist(pid)) {
			this.pl[pid] = new Player({id: pid, name: name});
			//console.log('Added Player ' + this.pl[pid]);
			return true;
		}
			
		console.log('E: Attempt to add a new player already in the player list' + this.pl.id);
		return false;
	};
	
	PlayerList.prototype.remove = function (pid) {	
		// Check if the id exists
		if (this.exist(pid)) {
			delete this.pl[pid];
		
			return true;
		}
		
		console.log('E: Attempt to remove a non-existing player from the the player list');
		return false;
	};
	
	PlayerList.prototype.get = function (pid) {	
		// Check if the id exists
		if (this.exist(pid)) {
			return this.pl[pid];
		}
		
		console.log('W: Attempt to access a non-existing player from the the player list ' + pid);
		return false;
	};
	
	PlayerList.prototype.pop = function (pid) {	
		var p = this.get(pid);
		if (p) {
			this.remove(pid);
		}
		return p;
	};
	
	PlayerList.prototype.getRandom = function () {	
		return this.toArray()[Math.floor(Math.random()*(this.size()))];
	};
	
	
	PlayerList.prototype.getAllIDs = function () {	
		
	     return this.map(function(o){
	    	 return o.getId();
	     	});
	};
	
	
	PlayerList.prototype.updatePlayer = function (player) {
		
		if (this.exist(pid)) {
			this.pl[pid] = player;
		
			return true;
		}
		
		console.log('W: Attempt to access a non-existing player from the the player list ' + player.id);
		return false;
	};
	
	PlayerList.prototype.updatePlayerState = function (pid, state) {
				
		if (!this.exist(pid)) {
			console.log('W: Attempt to access a non-existing player from the the player list ' + player.id);
			return false;	
		}
		
		if ('undefined' === typeof state) {
			console.log('W: Attempt to assign to a player an undefined state');
			return false;
		}
		
		//console.log(this.pl);
		
		this.pl[pid].state = state;	
	
		return true;
	};
	
	PlayerList.prototype.exist = function (pid) {
		return (typeof(this.pl[pid]) !== 'undefined') ? true : false;
	};
	
	// Returns an array of array of n groups of players {pid: name}
	//The last group could have less elements.
	PlayerList.prototype.getNGroups = function (n) {
		
		var copy = this.toArray();
		var nPlayers = copy.length;
		
		var gSize = Math.floor( nPlayers / n);
		var inGroupCount = 0;
		
		var result = new Array();
		
		// Init values for the loop algorithm
		var i;
		var idx;
		var gid = -1;
		var count = gSize +1; // immediately creates a new group in the loop
		for (i=0;i<nPlayers;i++){
			
			// Prepare the array container for the elements of the new group
			if (count >= gSize) {
				gid++;
				result[gid] = new PlayerList();
				count = 0;
			}
			
			// Get a random idx between 0 and array length
			idx = Math.floor(Math.random()*copy.length);
			
			result[gid].add(copy[idx].id,copy[idx].name);
			copy.splice(idx,1);
			count++;
		}
		
		return result;
	};
	
	// Returns an array of array of groups of n players {pid: name};
	// The last group could have less elements.
	PlayerList.prototype.getGroupsSizeN = function (n) {
		// TODO: getGroupsSizeN
	};
	
	
	PlayerList.prototype.checkState = function(gameState,strict) {
		if (this.isStateDone(gameState,strict)) {
			node.emit('STATEDONE');
		}
	};
	
	// TODO: improve
	// Returns true if all the players are on the same gameState = gameState
	// and they are all GameState = DONE.
	// If strict is TRUE, also not initialized players are taken into account
	PlayerList.prototype.isStateDone = function(gameState, strict) {
		
		//console.log('1--------> ' + gameState);
		
		// Check whether a gameState variable is passed
		// if not try to use the node.game.gameState as the default state
		// if node.game has not been initialized yet return false
		if ('undefined' === typeof gameState){
			if ('undefined' === typeof node.game) {
				return false;
			}
			else {
				var gameState = node.game.gameState;
			}
		}
		
		//console.log('2--------> ' + gameState);
		
		var strict = strict || false;
		
		var result = this.map(function(p){
			var gs = new GameState(p.state);
			
			//console.log('Going to compare ' + gs + ' and ' + gameState);
			
			// Player is done for his state
			if (p.state.is !== GameState.iss.DONE) {
				return 0;
			}
			// The state of the player is actually the one we are interested in
			if (GameState.compare(gameState, p.state, false) !== 0) {
				return 0;
			}
			
			return 1;
		});
		
		var i;
		var sum = 0;
		for (i=0; i<result.length;i++) {
			sum = sum + Number(result[i]);
		}
		
		var total = (strict) ? this.size() : this.actives(); 
		
		return (sum === total) ? true : false;
		
	};
	
	// Returns the number of player whose state is different from 0:0:0
	PlayerList.prototype.actives = function(gameState) {
		var result = 0;
		
		this.forEach(function(p){
			var gs = new GameState(p.state);
			
			// Player is done for his state
			if (GameState.compare(gs, new GameState()) !== 0) {
				result++;
			}
			
		});
		
		//console.log('ACTIVES: ' + result);
		
		return result;
	};
	
	
	PlayerList.prototype.toArray = function () {
	
		var result = Array();
		
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	result.push(this.pl[key]);
		    }
		}
		return result;
		return result.sort();
		
	};
	
	PlayerList.prototype.forEach = function(callback, thisArg) {
		  
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	callback.call(thisArg, this.pl[key]);
		    }
		  }
	};
	
	PlayerList.prototype.map = function(callback, thisArg) {
		 
		 var result = new Array();
		 
		 for (var key in this.pl) {
			 if (this.pl.hasOwnProperty(key)) {
				 result.push(callback.call(thisArg, this.pl[key]));
			 }
		  }
	
		  return result;
	};
	
	
	PlayerList.prototype.toString = function (eol) {
		
		var out = '';
		var EOL = eol || '\n';
		
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	out += key + ': ' + this.pl[key].name;
		    	var state = new GameState(this.pl[key].state);
		    	//console.log('STATE: ' + this.pl[key].state.state);
		    	
		    	out += ': ' + state + EOL;
		    }
		}
		
		return out;
		
	};
	
	//Player
	
	/**
	 * Expose constructor
	 */
	
	exports.Player = Player;
	
	function Player (pl) {
		
		// PRIVATE variables
		this.id = pl.id;
		this.name = pl.name;
		this.state = pl.state || new GameState();
	}
	
	Player.prototype.getId = function() {
		return this.id;
	};
	
	Player.prototype.getName = function() {
		return this.name;
	};
	
	Player.prototype.updateState = function (state) {
		this.state = state;
	};
	
	Player.prototype.toString = function() {
		var out = this.getName() + ' (' + this.getId() + ') ' + new GameState(this.state);
		return out;
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
); 
 
(function (exports, node) {

	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/**
	 * Exposing constructor
	 */
	exports.GameMsg = GameMsg;
	/*
	 * JSON Data Format for nodeGame Apps.
	 */
	GameMsg.actions = {};
	GameMsg.targets = {};
	
	GameMsg.actions.SET 	= 'set'; 	// Changes properties of the receiver
	GameMsg.actions.GET 	= 'get'; 	// Ask a properties of the receiver
	GameMsg.actions.SAY		= 'say'; 	// Announce properties of the sender
	
	GameMsg.targets.HI		= 'HI';		// Introduction
	GameMsg.targets.STATE	= 'STATE';	// STATE
	GameMsg.targets.PLIST 	= 'PLIST';	// PLIST
	GameMsg.targets.TXT 	= 'TXT';	// Text msg
	GameMsg.targets.DATA	= 'DATA';	// Contains a data-structure in the data field
	
	GameMsg.targets.ACK		= 'ACK';	// A reliable msg was received correctly
	
	GameMsg.targets.WARN 	= 'WARN';	// To do.
	GameMsg.targets.ERR		= 'ERR';	// To do.
	
	GameMsg.IN				= 'in.';	// Prefix for incoming msgs
	GameMsg.OUT				= 'out.';	// Prefix for outgoing msgs
			
	
	/**
	 * Exporting constants
	 * 
	 */
//	exports.actions = GameMsg.actions;
//	exports.targets = GameMsg.targets;
//	
	
	function GameMsg (gm) {
		this.id = Math.floor(Math.random()*1000000);
		
		this.session = gm.session;
		this.state = gm.state;
		this.target = gm.target; // was action
		this.from = gm.from;
		this.to = gm.to;
		this.text = gm.text;
		this.action = gm.action; 
		this.data = gm.data;
		this.priority = gm.priority;
		this.reliable = gm.reliable;
		
		this.created = Utils.getDate();
		this.forward = 0; // is this msg just a forward?	
	};
	
	// Copy everything
	GameMsg.clone = function (gameMsg) {
		
		var gm = new GameMsg(gameMsg);
		
		gm.id = gameMsg.id;
		gm.forward = gameMsg.forward;
		// TODO: Check also created ?
		gm.created = gameMsg.created;
		
		return gm;
	};
	
	GameMsg.prototype.stringify = function() {
		return JSON.stringify(this);
	};
	
	GameMsg.prototype.toString = function() {
		
		var SPT = ",\t";
		var SPTend = "\n";
		var DLM = "\"";
		
		var gs = new GameState(this.state);
		
		var line = this.created + SPT;
			line += this.id + SPT;
			line += this.session + SPT;
			line += this.action + SPT;
			line += this.target + SPT;
			line +=	this.from + SPT;
			line += this.to + SPT;
			line += DLM + this.text + DLM + SPT;
			line += DLM + this.data + DLM + SPT; // maybe to remove
			line += this.reliable + SPT;
			line += this.priority + SPTend;
			
			
		return line;
		
	};
	
	GameMsg.prototype.toSMS = function () {
		
		var parseDate = /\w+/; // Select the second word;
		var results = parseDate.exec(this.created);
		//var d = new Date(this.created);
		//var line = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
		//var line = results[0];
		var line = '[' + this.from + ']->[' + this.to + ']\t';
		line += '|' + this.action + '.' + this.target + '|'+ '\t';
		line += ' ' + this.text + ' ';
		
		return line;
	};
	
	GameMsg.prototype.toInEvent = function() {
		return 'in.' + this.toEvent();
	};
	
	GameMsg.prototype.toOutEvent = function() {
		return 'out.' + this.toEvent();
	};
	
	GameMsg.prototype.toEvent = function () {
		return this.action + '.' + this.target;
	}; 
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
); 
 
(function (exports, node) {
	
	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/*
	 * GameLoop
	 * 
	 * Handle the states of the game
	 * 
	 */
	
	/**
	 * Expose constructor
	 */
	
	exports.GameLoop = GameLoop;
	
//	function GameLoop (loop) {
//		this.loop = loop;
//		
//		this.limits = Array();
//		
//		for (var key in this.loop) {
//			if (this.loop.hasOwnProperty(key)) {
//				var round = loop[key].rounds || 1;
//				this.limits.push({rounds:round,steps:Utils.getListSize(this.loop[key]['loop'])});
//			}
//		}
//		
//		this.nStates = this.limits.length;
//		
//	}
	
	function GameLoop (loop) {
		this.loop = loop;
		
		this.limits = Array();
		
		for (var key in this.loop) {
			if (this.loop.hasOwnProperty(key)) {
				
				// Transform the loop obj if necessary.
				// When a state executes only one step,
				// it is allowed to pass directly the name of the function.
				// So such function must be incapsulated in a obj here.
				var loop = this.loop[key]['state'];
				if ('function' === typeof loop) {
					var steps = 1;
					this.loop[key]['state'] = {1: {state: loop,
												   name: this.loop[key].name || key + '.1.1'
												}};
				}
				
				var steps = Utils.getListSize(this.loop[key]['state'])
				
				
				var round = this.loop[key].rounds || 1;
				this.limits.push({rounds:round,steps:steps});
			}
		}
		
		this.nStates = this.limits.length;
	}
	
	
	GameLoop.prototype.exist = function (gameState) {
	
		if (typeof(this.loop[gameState.state]) === 'undefined') {
			console.log('(E): Unexisting state: ' + gameState.state);
			return false;
		}
		
		if (typeof(this.loop[gameState.state]['state'][gameState.step]) === 'undefined'){
			console.log('(E): Unexisting step: ' + gameState.step);
			return false;
		}
		// States are 1 based, arrays are 0-based => -1
		if (gameState.round > this.limits[gameState.state-1]['rounds']) {
			console.log('(E): Unexisting round: ' + gameState.round + 'Max round: ' + this.limits[gameState.state]['rounds']);
			return false;
		}
		
		//console.log('This exist: ' + gameState);
			
		return true;
	};
			
	GameLoop.prototype.next = function (gameState) {

		//console.log('NEXT OF THIS ' + gameState);
		//console.log(this.limits);
		
		// Game has not started yet, do it!
		if (gameState.state === 0) {
			//console.log('NEXT: NEW');
			return new GameState({
								 state: 1,
								 step: 1,
								 round: 1
			});
		}
		
		if (!this.exist(gameState)) {
			console.log('No next state of non-existing state: ' + gameState);
			return false;
		}
		
		var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
		
		if (this.limits[idxLimit]['steps'] > gameState.step){
			var newStep = Number(gameState.step)+1;
	//		console.log('Limit: ' + this.limits[gameState.state]['steps']);
//			console.log('NEXT STEP: '  + new GameState({
//														state: gameState.state,
//														step: newStep,
//														round: gameState.round
//			}));
//			
			return new GameState({
				state: gameState.state,
				step: newStep,
				round: gameState.round
			});
		}
		
		if (this.limits[idxLimit]['rounds'] > gameState.round){
			var newRound = Number(gameState.round)+1;
			//console.log('NEXT ROUND: ' + new GameState(gameState.state,1,newRound));
			return new GameState({
				state: gameState.state,
				step: 1,
				round: newRound
			});
		}
		
		if (this.nStates > gameState.state){		
			var newState = Number(gameState.state)+1;
			//console.log('NEXT STATE: ' + new GameState(newState,1,1));
			//return new GameState(newState,1,1);
			return new GameState({
				state: newState,
				step: 1,
				round: 1
			});
		}
		
		return false; // game over
	};
	
	GameLoop.prototype.previous = function (gameState) {
		
		if (!this.exist(gameState)) {
			console.log('No previous state of non-existing state: ' + gameState);
		}
		
		var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
		
		if (gameState.step > 1){
			var oldStep = Number(gameState.step)-1;
			//return new GameState(gameState.state,oldStep,gameState.round);
			return new GameState({
				state: gameState.state,
				step: oldStep,
				round: gameState.round
			});
		}
		else if (gameState.round > 1){
			var oldRound = Number(gameState.round)-1;
			var oldStep = this.limits[idxLimit]['steps'];
			return new GameState({
				state: gameState.state,
				step: oldStep,
				round: oldRound
			});
		}
		else if (gameState.state > 1){
			var oldRound = this.limits[idxLimit-1]['rounds'];
			var oldStep = this.limits[idxLimit-1]['steps'];
			var oldState = idxLimit;
			return new GameState({
				state: oldState,
				step: oldStep,
				round: oldRound
			});
		}
		
		return false; // game init
	};
	
	GameLoop.prototype.getName = function(gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step]['name'];
	};
	
	GameLoop.prototype.getFunction = function(gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step]['state'];
	};
	
	GameLoop.prototype.jumpTo = function (gameState, jump) {
		if (!this.exist(gameState)) return false;
		if (!jump || jump === 0) return gameState;
		
		var gs = gameState;	
		var func = (jump > 0) ? this.next : this.previous;
		
		for (var i=0; i < Math.abs(jump); i++) {
			gs = func.call(this,gs);
			if (!gs) return false;
		}
		
//		console.log('FROM');
//		console.log(gameState);		
//		console.log('TO');
//		console.log(gs);
		
		return gs;
	};
	

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
); 
 
(function (exports, node) {
	
	var GameMsg = node.GameMsg;
	var GameState = node.GameState;
	var Player = node.Player;
	
	/*
	 * GameMsgGenerator
	 * 
	 * 
	 * All message are reliable, but TXT messages.
	 * 
	 */
	
	/**
	 * Expose constructor
	 */
	
	exports.GameMsgGenerator = GameMsgGenerator; 
	
	function GameMsgGenerator (session, sender, state) {	
		this.session = session;
		this.sender = sender;
		this.state = state;
	};	
	
	// HI
	
	//Notice: this is different from the server;
	GameMsgGenerator.prototype.createHI = function(player,to,reliable) {
	
	  var rel = reliable || 1;
	  
	  return new GameMsg( {
	            			session: this.session,
	            			state: this.state,
	            			action: GameMsg.actions.SAY,
	            			target: GameMsg.targets.HI,
	            			from: this.sender,
	            			to: to,
	            			text: new Player(player) + ' ready.',
	            			data: player,
	            			priority: null,
	            			reliable: rel
	  });
	
	
	};
	
	// STATE
	
	GameMsgGenerator.prototype.saySTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.SAY, plist, to,reliable);
	};
	
	GameMsgGenerator.prototype.setSTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.SET, plist, to,reliable);
	};
	
	GameMsgGenerator.prototype.getSTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.GET, plist, to,reliable);
	};
	
	GameMsgGenerator.prototype.createSTATE = function (action, state, to, reliable) {
		
		var rel = reliable || 1;
		
		
		return new GameMsg({
							session: this.session,
							state: this.state,
							action: action,
							target: GameMsg.targets.STATE,
							from: this.sender,
							to: to,
							text: 'New State: ' + GameState.stringify(state),
							data: state,
							priority: null,
							reliable: rel
		});
	};
	
	
	// PLIST
	
	GameMsgGenerator.prototype.sayPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.SAY, plist, to,reliable);
	};
	
	GameMsgGenerator.prototype.setPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.SET, plist, to,reliable);
	};
	
	GameMsgGenerator.prototype.getPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.GET, plist, to, reliable);
	};
	
	GameMsgGenerator.prototype.createPLIST = function (action, plist, to, reliable) {
		
		//console.log('Creating plist msg ' + plist + ' ' + plist.size());
		
		var rel = reliable || 1;
		
		return new GameMsg({
							session: this.session, 
							state: this.state,
							action: action,
							target: GameMsg.targets.PLIST,
							from: this.sender,
							to: to,
							text: 'List of Players: ' + plist.size(),
							data: plist.pl,
							priority: null,
							reliable: rel
		});
	};
	
	
	// TXT
	
	GameMsgGenerator.prototype.createTXT = function (text, to, reliable) {
		
		//console.log("STE: " + text);
		
		var rel = reliable || 0;
		
		return new GameMsg({
							session: this.session,
							state: this.state,
							action: GameMsg.actions.SAY,
							target: GameMsg.targets.TXT,
							from: this.sender,
							to: to,
							text: text,
							data: null,
							priority: null,
							reliable: rel
		});
		
		
	};
	
	
	// DATA


	GameMsgGenerator.prototype.sayDATA = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.SAY, data, to, text, reliable);
	};

	GameMsgGenerator.prototype.setDATA = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.SET, data, to, text, reliable);
	};

	GameMsgGenerator.prototype.getPLIST = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.GET, data, to, text, reliable);
	};
	
	GameMsgGenerator.prototype.createDATA = function (action, data, to, text, reliable) {
		
		var rel = reliable || 1;
		var text = text || 'data msg';
		
		return new GameMsg({
							session: this.session, 
							state: this.state,
							action: action,
							target: GameMsg.targets.DATA,
							from: this.sender,
							to: to,
							text: text,
							data: data,
							priority: null,
							reliable: rel
		});
	};
	
	
	// ACK
	
	GameMsgGenerator.prototype.createACK = function (gm, to, reliable) {
		
		var rel = reliable || 0;
		
		var newgm = new GameMsg({
								session: this.session, 
								state: this.state,
								action: GameMsg.actions.SAY,
								target: GameMsg.targets.ACK,
								from: this.sender,
								to: to,
								text: 'Msg ' + gm.id + ' correctly received',
								data: gm.id,
								priority: null,
								reliable: rel
		});
		
		if (gm.forward) {
			newgm.forward = 1;
		}
		
		return newgm;
	}; 

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
); 
 
(function (exports, node, io) {
		
	var GameMsg = node.GameMsg;
	var GameState = node.GameState;
	var Player = node.Player;
	var GameMsgGenerator = node.GameMsgGenerator;
	
	/**
	 * Expose constructor;
	 *
	 */
	exports.GameSocketClient = GameSocketClient;
	
	
	
	function GameSocketClient (options, nodeGame) {
		
		this.name = options.name;
		this.url = options.url;
		
		this.servername = null;
		this.game = null;
		
		this.io = null; // will be created only after the game is loaded;
		this.buffer = [];
	}
	
	GameSocketClient.prototype.setGame = function(game) {
		this.game = game;
		this.io = this.connect();
	};
	
	GameSocketClient.prototype.connect = function() {
		// TODO: add check if http:// is already in
		console.log('nodeGame: connecting to ' + this.url);
		var socket = io.connect(this.url);
	    this.attachFirstListeners(socket);
	    return socket;
	};
	
	
	/*
	
	I/O Functions
	
	*/
	
	//Parse the message received in the Socket
	GameSocketClient.prototype.secureParse = function (msg) {
		
		try {
			//console.log(msg);
			//debugger;
			var gameMsg = GameMsg.clone(JSON.parse(msg));
			console.log('R: ' + gameMsg);			
			node.emit('LOG', 'R: ' + gameMsg.toSMS());
			return gameMsg;
		}
		catch(e) {
			var error = "Malformed msg received: " + e;
			console.log(error);
			node.emit('LOG', 'E: ' + error);
			return false;
		}
		
	};
		
	GameSocketClient.prototype.clearBuffer = function () {
		
		var nelem = this.buffer.length;
		for (var i=0; i < nelem; i++) {
			var msg = this.buffer.shift();
			node.emit(msg.toInEvent(), msg);
			//console.log('Debuffered ' + msg);
		}
	
	};
	
	/**
	 * Nothing is done until the SERVER send an HI msg. All the others msgs will 
	 * be ignored otherwise.
	 */
	GameSocketClient.prototype.attachFirstListeners = function (socket) {
		
		var that = this;
		
		socket.on('connect', function (msg) {
			var connString = 'nodeGame: connection open';
		    console.log(connString); 
		    
		    socket.on('message', function (msg) {	
		    	
		    	var msg = that.secureParse(msg);
		    	
		    	if (msg) { // Parsing successful
					if (msg.target === 'HI') {
						that.player = new Player({id:msg.data,name:that.name});
						that.servername = msg.from;
						
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						// Send own name to SERVER
						that.sendHI(that.player, 'ALL');
						// Ready to play
						node.emit('out.say.HI');
				   	 } 
		    	}
		    });
		    
		});
		
	    socket.on('disconnect', function() {
	    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
	    	console.log('closed');
	    });
	};
	
	GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
		var that = this;
		
		console.log('nodeGame: Attaching FULL listeners');
		socket.removeAllListeners('message');
			
		this.gmg = new GameMsgGenerator(session,this.player.getId(),new GameState());
	
		socket.on('message', function(msg) {
			var msg = that.secureParse(msg);
			
			if (msg) { // Parsing successful
				//console.log('GM is: ' + that.game.gameState.is);
				// Wait to fire the msgs if the game state is loading
				if (that.game && that.game.isGameReady()) {
					//console.log('GM is now: ' + that.game.gameState.is);
					
//					var event = msg.toInEvent();
//					
//					
//					if (event !== 'in.say.DATA') {
//						node.emit(event, msg);
//					}
//					else {
//						node.emit('in.' +  msg.action + '.' + msg.text, msg);
//					}
					
					node.emit(msg.toInEvent(), msg);
				}
				else {
					//console.log(that.game.gameState.is + ' < ' + GameState.iss.PLAYING);
					//console.log('Buffering: ' + msg);
					that.buffer.push(msg);
				}
			}
		});
	};
	
	GameSocketClient.prototype.sendHI = function (state, to) {
		var to = to || 'SERVER';
		var msg = this.gmg.createHI(this.player, to);
		this.game.player = this.player;
		this.send(msg);
	};
	
	// TODO: other things rely on this methods which has changed
	GameSocketClient.prototype.sendSTATE = function(action, state, to) {	
		var msg = this.gmg.createSTATE(action,state,to);
		this.send(msg);
	};
	
	GameSocketClient.prototype.sendTXT = function(text, to) {	
		var msg = this.gmg.createTXT(text,to);
		this.send(msg);
	};
	
	GameSocketClient.prototype.sendDATA = function (action, data, to, msg) {
		var to = to || 'SERVER';
		var msg = msg || 'DATA';
		var msg = this.gmg.createDATA(action, data, to, msg);
		this.send(msg);
	};
	
	/**
	 * Write a msg into the socket. 
	 * 
	 * The msg is actually received by the client itself as well.
	 */
	GameSocketClient.prototype.send = function (msg) {
		
		// TODO: Check Do volatile msgs exist for clients?
		
		//if (msg.reliable) {
			this.io.send(msg.stringify());
		//}
		//else {
		//	this.io.volatile.send(msg.stringify());
		//}
		console.log('S: ' + msg);
		node.emit('LOG', 'S: ' + msg.toSMS());
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
); 
 
(function (exports, node) {
	
	
	/**
	 * 
	 * GameDB provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a new GameDB obj (can be concatenated):
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
	
	var JSUS = node.Utils;
	var NDDB = node.NDDB;
		
	var GameState = node.GameState;
	
	/**
	 * Expose constructors
	 */
	exports.GameDB = GameDB;
	exports.GameBit = GameBit;

	/**
	 * GameDB interface
	 *
	 * @api public
	 */
	
	function GameDB (options, db) {
	  var options = options || {};
	  // Inheriting from NDDB	
	  JSUS.extend(node.NDDB, this);
	  node.NDDB.call(this, options, db);
	  this.set('state', GameBit.compareState);
	};
	
	GameDB.prototype.add = function (player, key, value, state) {
		var state = state || node.game.gameState;

		this.insert(new GameBit({
										player: player, 
										key: key,
										value: value,
										state: state
		}));

		return true;
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
	
//	GameBit.compareValueByKey = function (key) {
//	    return function (a,b) {
//	        return (a.value[key] < b.value[key]) ? -1 : (a.value[key] > b.value[key]) ? 1 : 0;
//	    }
//	}

	
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

 
 
(function (exports, node) {
	
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var GameDB = node.GameDB;
	var PlayerList = node.PlayerList;
	var GameLoop = node.GameLoop;
	var Utils = node.Utils;
	
	/*
	 * Game
	 *
	 */
	
	/**
	 * Expose constructor
	 */
	exports.Game = Game;
	
	function Game (settings, gamesocketclient) {
		
		// TODO: transform into private variables, otherwise they can accidentally 
		// modified  by the execution of the loops functions
		
		// If not defined they take default settings
		this.name = settings.name || "A standard game";
		this.description = settings.description || 'No Description';
		
		this.observer = ('undefined' !== typeof settings.observer) ? settings.observer : false;
		
		this.gameLoop = new GameLoop(settings.loops);
		 
		// TODO: gameState should be inside player
		this.player = null;	
		this.gameState = new GameState();
		
		this.automatic_step = settings.automatic_step || false;
		
		this.minPlayers = settings.minPlayers || 1;
		this.maxPlayers = settings.maxPlayers || 1000;
		
		// TODO: Check this
		this.init = settings.init || this.init;
		
		this.gsc = gamesocketclient;
		
		this.pl = new PlayerList();
		
		this.memory = new GameDB();
		
		var that = this;
		var say = GameMsg.actions.SAY + '.';
		var set = GameMsg.actions.SET + '.';
		var get = GameMsg.actions.GET + '.'; 	
		var IN  = GameMsg.IN;
		var OUT = GameMsg.OUT;
		
		// INCOMING EVENTS
		var incomingListeners = function() {
			
			// Get
			
			// TODO: can we avoid the double emit?
			node.on( IN + get + 'DATA', function(msg){
				node.emit(msg.text, msg.data);
			});
			
			// Set
			node.on( IN + set + 'STATE', function(msg){
				that.memory.add(msg.from, msg.text, msg.data);
			});
			
			node.on( IN + set + 'DATA', function(msg){
				that.memory.add(msg.from, msg.text, msg.data);
			});
			
			// Say

			// If the message is from the server, update the game state
			// If the message is from a player, update the player state
			node.on( IN + say + 'STATE', function(msg){
				
				// Player exists
				if (that.pl.exist(msg.from)) {
					//node.log('updatePlayer', 'DEBUG);
					that.pl.updatePlayerState(msg.from, msg.data);
					node.emit('UPDATED_PLIST');
					that.pl.checkState();
				}
				// Assume this is the server for now
				// TODO: assign a string-id to the server
				else {
					//node.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data), 'DEBUG');
					that.updateState(msg.data);
				}
			});
			
			node.on( IN + say + 'PLIST', function(msg) {
				that.pl = new PlayerList(msg.data);
				node.emit('UPDATED_PLIST');
				that.pl.checkState();
			});
		}();
		
		var outgoingListeners = function() {
			
			// SAY
			
			node.on( OUT + say + 'HI', function(){
				// Upon establishing a successful connection with the server
				// Enter the first state
				if (that.automatic_step) {
					that.updateState(that.next());
				}
				else {
					// The game is ready to step when necessary;
					that.gameState.is = GameState.iss.LOADED;
					that.gsc.sendSTATE(GameMsg.actions.SAY, that.gameState);
				}
			});
			
			node.on( OUT + say + 'STATE', function (state, to) {
				//node.log('BBBB' + p + ' ' + args[0] + ' ' + args[1] + ' ' + args[2], 'DEBUG');
				that.gsc.sendSTATE(GameMsg.actions.SAY, state, to);
			});	
			
			node.on( OUT + say + 'TXT', function (text, to) {
				that.gsc.sendTXT(text,to);
			});
			
			node.on( OUT + say + 'DATA', function (data, to, key) {
				that.gsc.sendDATA(GameMsg.actions.SAY, data, to, key);
			});
			
			// SET
			
			node.on( OUT + set + 'STATE', function (state, to) {
				that.gsc.sendSTATE(GameMsg.actions.SET, state, to);
			});
			
			node.on( OUT + set + 'DATA', function (data, to, key) {
				that.gsc.sendDATA(GameMsg.actions.SET, data, to, key);
			});
			
			// GET
			
			node.on( OUT + get + 'DATA', function (data, to, key) {
				that.gsc.sendDATA(GameMsg.actions.SAY, data, to, key);
			});
			
		}();
		
		var internalListeners = function() {
			
			node.on('STATEDONE', function() {
				// If we go auto
				if (that.automatic_step) {
					//node.log('WE PLAY AUTO', 'DEBUG');
					var morePlayers = ('undefined' !== that.minPlayers) ? that.minPlayers - that.pl.size() : 0 ;
					
					if (morePlayers > 0 ) {
						node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
						node.log( morePlayers + ' player/s still needed to play the game');
					}
					// TODO: differentiate between before the game starts and during the game
					else {
						node.emit('OUT.say.TXT', this.minPlayers + ' players ready. Game can proceed');
						node.log( that.pl.size() + ' players ready. Game can proceed');
						that.updateState(that.next());
					}
				}
//				else {
//					node.log('WAITING FOR MONITOR TO STEP', 'DEBUG');
//				}
			});
			
			node.on('DONE', function(msg) {
				that.gameState.is = GameState.iss.DONE;
				that.publishState();
			});
			
			node.on('WAIT', function(msg) {
				that.gameState.paused = true;
				that.publishState();
			});
			
			node.on('WINDOW_LOADED', function(){
				if (that.isGameReady()) {
					node.emit('LOADED');
				}
			});
			
			node.on('GAME_LOADED', function() {
				if (that.isGameReady()) {
					node.emit('LOADED');
				}
			});
			
			node.on('LOADED', function(){
				that.gameState.is =  GameState.iss.PLAYING;
				//node.log('STTTEEEP ' + that.gameState.state, 'DEBUG');		
				that.gsc.clearBuffer();
			});
			
		}();
			
	}
	
	// Dealing with the STATE
	
	Game.prototype.pause = function() {
		this.gameState.paused = true;
	};
	
	Game.prototype.resume = function() {
		this.gameState.paused = false;
	};
	
	Game.prototype.next = function(times) {
		if (!times) return this.gameLoop.next(this.gameState);
		return this.gameLoop.jumpTo(this.gameState, Math.abs(times));
	};
	
	Game.prototype.previous = function (times) {
		if (!times) return this.gameLoop.previous(this.gameState);
		return this.gameLoop.jumpTo(this.gameState, -Math.abs(times));
	};
	
	Game.prototype.jumpTo = function (jump) {
		var gs = this.gameLoop.jumpTo(this.gameState, jump);
		if (!gs) return false;
		return this.updateState(gs);
	};

	
//	Game.prototype.is = function(is) {
//		//console.log('IS ' + is);
//		this.gameState.is = is;
//		// TODO Check whether we should do it here or no
//		// this.publishState();
//	};
	
	Game.prototype.publishState = function() {
		//node.log('Publishing ' + this.gameState, 'DEBUG');
		this.gsc.gmg.state = this.gameState;
		// Important: SAY
		
		if (!this.observer) {
			var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
			node.emit(stateEvent,this.gameState,'ALL');
		}
		
		node.emit('STATECHANGE');
		node.log('New State = ' + this.gameState);
	};
	
	Game.prototype.updateState = function(state) {
		
		//node.log('New state is going to be ' + new GameState(state));
		
		if (this.step(state) !== false){
			this.paused = false;
			this.gameState.is =  GameState.iss.LOADED;
			if (this.isGameReady()) {
				node.emit('LOADED');
			}
		}		
		else {
			node.log('Error in stepping', 'ERR');
			// TODO: implement sendERR
			node.emit('TXT','State was not updated');
			// Removed
			//this.publishState(); // Notify anyway what happened
		}
	};
	
	
	Game.prototype.step = function(state) {
		
		var gameState = state || this.next();
		if (gameState) {
			var func = this.gameLoop.getFunction(gameState);
			
			if (func) {
				gameState.is = GameState.iss.LOADING;
				this.gameState = gameState;
			
				// This could speed up the loading in other client,
				// but now causes problems of multiple update
				this.publishState();
				
				// Local Listeners from previous state are erased before proceeding
				// to next one
				node.node.clearLocalListeners();
				return func.call(node.game);
			}
		}
		
		return false;
		
	};
	
	Game.prototype.dump = function(reverse) {
		return this.memory.dump(reverse);
	}
	
	Game.prototype.init = function() {
		
	//	var header = this.window.addHeader(document.getElementById('root'), 'header');
	//	header.innerHTML = '<h1>'+ this.name + '</h1>';
	//	header.innerHTML += '<p>' + this.description + '</p>';
	//	var button = this.window.addButton(header,'sendbutton');
	//	
	//	var that = this;
	//	button.onclick = function() {
	//	  that.DONEWAIT('FUNZIA');
	//	};
	}; 
	
	
	Game.prototype.isGameReady = function() {
		
		//node.log('GameState is : ' + this.gameState.is, 'DEBUG');
		
		if (this.gameState.is < GameState.iss.LOADED) return false;
		
		// Check if there is a gameWindow obj and whether it is loading
		if (node.window) {
			
			// node.log('WindowState is ' + node.window.state, 'DEBUG');
			return (node.window.state >= GameState.iss.LOADED) ? true : false;
		}
		
		return true;
	};
	

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
 
 
/*!
 * nodeGame
 */

(function (exports) {
	
	var node = exports;

	// Memory related operations
	// Will be initialized later
	node.memory = {};
	

	// Load the auxiliary library if available in the browser
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB; 
    
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
	
		/**
	     * Expose Socket.io-client
	     *
	     * @api public
	     */
	
	    node.io = require('socket.io-client');
		
		/**
	     * Expose EventEmitter
	     *
	     * @api public
	     */
	
	    node.EventEmitter = require('./EventEmitter').EventEmitter;
	    
	    /**
	     * Expose JSU
	     *
	     * @api public
	     */
	
	    node.JSUS = require('JSUS').JSUS;
		
	    /**
	     * Expose Utils
	     *
	     * @api public
	     */
	
	    node.utils = node.Utils = require('./Utils').Utils;
	    
	    /**
	     * Expose GameState.
	     *
	     * @api public
	     */
	
	    node.GameState = require('./GameState').GameState;
	
	    /**
	     * Expose PlayerList.
	     *
	     * @api public
	     */
	
	    node.PlayerList = require('./PlayerList').PlayerList;
	    
	    /**
	     * Expose Player.
	     *
	     * @api public
	     */
	
	    node.Player = require('./PlayerList').Player;
	
	    
	    /**
	     * Expose GameMsg
	     *
	     * @api public
	     */
	
	     node.GameMsg = require('./GameMsg').GameMsg;
	
	    /**
	     * Expose GameLoop
	     *
	     * @api public
	     */
	
	    node.GameLoop = require('./GameLoop').GameLoop;
	
	    
	    /**
	     * Expose GameMsgGenerator
	     *
	     * @api public
	     */
	
	    node.GameMsgGenerator = require('./GameMsgGenerator').GameMsgGenerator;
	    
	    /**
	     * Expose GameSocketClient
	     *
	     * @api public
	     */
	
	    node.GameSocketClient = require('./GameSocketClient').GameSocketClient;
	    
	
	    /**
	     * Expose NDDB
	     *
	     * @api public
	     */
	  	
	    node.NDDB = require('NDDB').NDDB;
	    
	    /**
	     * Expose GameStorage
	     *
	     * @api public
	     */
	
	    node.GameDB = require('./GameDB').GameDB;
	    
	    /**
	     * Expose Game
	     *
	     * @api public
	     */
	
	    node.Game = require('./Game').Game;

	  }
	  // end node
		
	
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.nodeGame = nodeGame;
	
	/**
	 *  Exposing constants
	 */	
	exports.actions = GameMsg.actions;
	exports.IN = GameMsg.IN;
	exports.OUT = GameMsg.OUT;
	exports.targets = GameMsg.targets;		
	exports.states = GameState.iss;
	
	
	// Constructor
	nodeGame.prototype.__proto__ = EventEmitter.prototype;
	nodeGame.prototype.constructor = nodeGame;
	
	function nodeGame() {
		EventEmitter.call(this);
		this.gsc = null;
		this.game = null;
	};
	
	
//	node.memory.get = function (reverse) {
//		return node.game.dump(reverse);
//	}
//
//	node.memory.getValues = function(reverse) {
//		return node.game.memory.getValues(reverse);
//	}
	
	/**
	 * Creating an object
	 */
	var that = node.node = new nodeGame();
	
	node.state = function() {
		return (that.game) ? node.node.game.gameState : false;
	};
	
	node.on = function (event, listener) {
		var state = this.state();
		//console.log(state);
		
		// It is in the init function;
		if (!state || (GameState.compare(state, new GameState(), true) === 0 )) {
			that.addListener(event, listener);
			//console.log('global');
		}
		else {
			that.addLocalListener(event, listener);
			//console.log('local');
		}
	};
	
	node.once = function (event, listener) {
		node.on(event, listener);
		node.on(event, function(event, listener) {
			that.removeListener(event, listener);
		});
	};
	
	node.play = function (conf, game) {	
		node.gsc = that.gsc = new GameSocketClient(conf);
		
		node.game = that.game = new Game(game, that.gsc);
		//node.memory = that.game.memory;
		// INIT the game
		that.game.init.call(that.game);
		that.gsc.setGame(that.game);
		
		console.log('nodeGame: game loaded...');
		console.log('nodeGame: ready.');
	};	
	
	node.observe = function (conf) {	
		node.gsc = that.gsc = new GameSocketClient(conf);
		
		// Retrieve the game and set is as observer
		node.get('GAME', function(game) {
			
			alert(game);
			
//			var game = game.observer = true;
//			node.game = that.game = game;
//			
//			that.game.init();
//			
//			that.gsc.setGame(that.game);
//			
//			console.log('nodeGame: game loaded...');
//			console.log('nodeGame: ready.');
		});
		
	};	
	
	node.fire = node.emit = function (event, p1, p2, p3) {	
		that.emit(event, p1, p2, p3);
	};	
	
	node.say = function (data, what, whom) {
		that.emit('out.say.DATA', data, whom, what);
	};
	
	/**
	 * Set the pair (key,value) into the server
	 * @value can be an object literal.
	 * 
	 * 
	 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		that.emit('out.set.DATA', value, null, key);
	}
	
	
	node.get = function (key, func) {
		that.emit('out.get.DATA', key);
		node.once(key, function(data) {
			func.call(node.game,data);
		});
	};
	

	
	// *Aliases*
	//
	// Conventions:
	//
	// - Direction:
	// 		'in' for all
	//
	// - Target:
	// 		DATA and TXT are 'say' as default
	// 		STATE and PLIST are 'set' as default
	
	
	// Sending
		
	
//	this.setSTATE = function(action,state,to){	
//		var stateEvent = GameMsg.OUT + action + '.STATE'; 
//		fire(stateEvent,action,state,to);
//	};
	
	// Receiving
	
	// Say
	
	node.onTXT = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onDATA = function(text, func) {
		node.on('in.say.DATA', function(msg) {
			if (text && msg.text === text) {
				func.call(that.game,msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			func.call(that.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onPLIST = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(that.game,msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.DONE = function (text) {
		node.emit("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.emit('out.say.TXT', text, to);
	};	
	
	node.random = {};
	
	// Generates event at RANDOM timing in milliseconds
	// if timing is missing, default is 6000
	node.random.emit = function (event, timing){
		var timing = timing || 6000;
		setTimeout(function(event) {
			node.emit(event);
		}, Math.random()*timing, event);
	};
	
	node.random.exec = function (func, timing) {
		var timing = timing || 6000;
		setTimeout(function(func) {
			func.call();
		}, Math.random()*timing, func);
	}
	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}
	
	node.goto = function(state) {
		node.game.updateState(state);
	};
	
	node.log = function(txt,level) {
		console.log(txt);
	};
	
	
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
		
		 /**
	     * Enable file system operations
	     */
	
	    node.csv = {};
	    node.fs = {};
	    
	    var fs = require('fs');
	    var path = require('path');
	    var csv = require('ya-csv');
	    
	    
	    /**
	     * Takes an obj and write it down to a csv file;
	     */
	    node.fs.writeCsv = function (path, obj) {
	    	var writer = csv.createCsvStreamWriter(fs.createWriteStream( path, {'flags': 'a'}));
	    	var i;
	        for (i=0;i<obj.length;i++) {
	    		writer.writeRecord(obj[i]);
	    	}
	    };
	    
	    node.memory.dump = function (path) {
			node.fs.writeCsv(path, node.game.memory.split().fetchValues());
	    }
	  
	}
	// end node
	
	
	
	
})('undefined' != typeof node ? node : module.exports); 
 
 
 
 
 
/*!
 * nodeWindow v0.6.5
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Sun Jan 8 15:30:54 CET 2012
 *
 */
 
 
(function(node) {
	
	/*!
	 * Document
	 * 
	 */
	
	// Create the window obj
	node.window = {};
	
	// Note: this will be erased, when the GameWindow obj will be created
	node.window.Document = Document;
	
	function Document() {};
	
	Document.prototype.addButton = function (root, id, text, attributes) {
		var sb = document.createElement('button');
		sb.id = id;
		sb.appendChild(document.createTextNode(text || 'Send'));	
		this.addAttributes2Elem(sb, attributes);
	
		root.appendChild(sb);
		return sb;
	};
	
	Document.prototype.addFieldset = function (root, id, legend, attributes) {
		var f = this.addElement('fieldset', root, id, attributes);
		var l = document.createElement('Legend');
		l.appendChild(document.createTextNode(legend));	
		f.appendChild(l);
		root.appendChild(f);
		return f;
	};
	
	Document.prototype.addTextInput = function (root, id, attributes) {
		var mt =  document.createElement('input');
		mt.id = id;
		mt.setAttribute('type', 'text');
		this.addAttributes2Elem(mt, attributes);
		root.appendChild(mt);
		return mt;
	};
	
	Document.prototype.addCanvas = function (root, id, attributes) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
			
		if (!context) {
			alert('Canvas is not supported');
			return false;
		}
		
		canvas.id = id;
		this.addAttributes2Elem(canvas, attributes);
		root.appendChild(canvas);
		return canvas;
	};
		
	Document.prototype.addSlider = function (root, id, attributes) {
		var slider = document.createElement('input');
		slider.id = id;
		slider.setAttribute('type', 'range');
		root.appendChild(slider);
		this.addAttributes2Elem(slider, attributes);
		return slider;
	};
	
	
	Document.prototype.addRadioButton = function (root, id, attributes) {
		var radio = document.createElement('input');
		radio.id = id;
		radio.setAttribute('type', 'radio');
		root.appendChild(radio);
		this.addAttributes2Elem(radio, attributes);
		return radio;
	};
	
	Document.prototype.addJQuerySlider = function (root, id, attributes) {
		var slider = document.createElement('div');
		slider.id = id;
		slider.slider(attributes);
		root.appendChild(slider);
		return slider;
	};
	
	
	Document.prototype.addLabel = function (root, id, labelText, forElem, attributes) {
		var label = document.createElement('label');
		label.id = id;
		label.appendChild(document.createTextNode(labelText));	
		label.setAttribute('for', forElem);
		this.addAttributes2Elem(label, attributes);
		
//		var root = node.window.getElementById(forElem);
		root.parentNode.insertBefore(label,root);
		
		return label;
		
//		// Add the label immediately before if no root elem has been provided
//		if (!root) {
//			var root = node.window.getElementById(forElem);
//			root.insertBefore(label);
//		}
//		else {
//			root.appendChild(label);
//		}
//		return label;
	};
	
	Document.prototype.addSelect = function (root, id, attributes) {
		return this.addElement('select', root, id, attributes);
	};
	
	Document.prototype.populateSelect = function (select,list) {
		
		for (var key in list) {
			if (list.hasOwnProperty(key)) {
				var opt = document.createElement('option');
				opt.value = list[key];
				opt.appendChild(document.createTextNode(key));
				select.appendChild(opt);
			}
		}
	};
	
	Document.prototype.write = function (root, text) {
		if (!root) return;
		if (!text) return;
		var tn = document.createTextNode(text);
		console.log('ROOT');
		console.log(root);
		console.log('TEXT');
		console.log(text);
		root.appendChild(tn);
		return tn;
	};
	
	Document.prototype.writeln = function (root, text, rc) {
		if (!root) return;
		var br = this.addBreak(root, rc);
		return (text) ? Document.prototype.write(root, text) : br;
	};
	
	// IFRAME
	
	Document.prototype.addIFrame = function (root, id, attributes) {
		var attributes = {'name' : id}; // For Firefox
		return this.addElement('iframe', root, id, attributes);
	};
	
	
	// BR
	
	Document.prototype.addBreak = function (root, rc) {
		var RC = rc || 'br';
		var br = document.createElement(RC);
		return root.appendChild(br);
		//return this.insertAfter(br,root);
	};
	
	// CSS
	
	Document.prototype.addCSS = function (root, css, id, attributes) {
		
		var attributes = attributes || {'rel' : 'stylesheet',
										'type': 'text/css'};
		
		attributes.href = css;
		
		var id = id || 'maincss';
		
		return this.addElement('link', root, id, attributes);
	};
	
	
	Document.prototype.addDiv = function (root, id, attributes) {
		return this.addElement('div', root, id, attributes);
	};
	
	
	Document.prototype.highlight = function (elem, code) {
		if (!elem) return;
		
		// default value is ERR		
		switch (code) {	
			case 'OK':
				var color =  'green';
				break;
			case 'WARN':
				var color = 'yellow';
				break;
			default:
				var color = 'red';
		}
		
		return this.addBorder(elem,color);
	};
	
	Document.prototype.addBorder = function (elem, color, witdh, type) {
		if (!elem) return;
		
		var color = color || 'red';
		var width = width || '5px';
		var type = type || 'solid';
		
		var properties = { border: width + ' ' + type + ' ' + color }
		return this.style(elem,properties);
	};
	
	Document.prototype.style = function (elem, properties) {
		if (!elem || !properties) return;
		
		var style = '';
		for (var i in properties) {
			style += i + ': ' + properties[i] + '; ';
		};
		return elem.setAttribute('style',style);
	};
	
	// TODO: Potentially unsafe
	// Works only with Chrome
	Document.prototype.loadFile = function (container,file) {
		
		// Check for the various File API support.
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		  console.log('The File APIs are not fully supported in this browser.');
		  return false;
		}
		function onInitFs(fs) {
		  console.log('Opened file system: ' + fs.name);
		}
		
		function errorHandler(e) {
			  var msg = '';
	
			  switch (e.code) {
			    case FileError.QUOTA_EXCEEDED_ERR:
			      msg = 'QUOTA_EXCEEDED_ERR';
			      break;
			    case FileError.NOT_FOUND_ERR:
			      msg = 'NOT_FOUND_ERR';
			      break;
			    case FileError.SECURITY_ERR:
			      msg = 'SECURITY_ERR';
			      break;
			    case FileError.INVALID_MODIFICATION_ERR:
			      msg = 'INVALID_MODIFICATION_ERR';
			      break;
			    case FileError.INVALID_STATE_ERR:
			      msg = 'INVALID_STATE_ERR';
			      break;
			    default:
			      msg = 'Unknown Error';
			      break;
			  }
	
			  console.log('Error: ' + msg);
		};
		
		// second param is 5MB, reserved space for storage
		window.requestFileSystem(window.PERSISTENT, 5*1024*1024, onInitFs, errorHandler);
		
			
		container.innerHTML += 'DONE FS';
		return container;
	};
	
	// Util
	
	Document.prototype.addElement = function (elem, root, id, attributes) {
		var e = document.createElement(elem);
		if (id) {
			e.id = id;
		}
		this.addAttributes2Elem(e, attributes);
		
		root.appendChild(e);
		return e;
	};
	
	Document.prototype.addAttributes2Elem = function (e, a) {
		
		for (var key in a) {
			if (a.hasOwnProperty(key)){
				if (key !== 'label') {
					e.setAttribute(key,a[key]);
				}
				else {
					// If a label element is present it checks whether it is an
					// object literal or a string.
					// In the former case it scans the obj for additional properties
					
					var labelId = 'label_' + e.id;
					var labelText = a.label;
					
					if (typeof(a[key]) === 'object') {
						var labelText = a.text;
						if (a.id) {
							labelId = a.id; 
						}
					}	
					this.addLabel(e, labelId, labelText, e.id);
				}
			}
		}
		return e;
	};
	
	Document.prototype.removeClass = function (element, className) {
		var regexpr = '/(?:^|\s)' + className + '(?!\S)/';
		element.className = element.className.replace( regexpr, '' );
	};

	
	Document.prototype.removeChildrenFromNode = function (e) {
		
	    if(!e) {
	        return false;
	    }
	    if(typeof(e)=='string') {
	        e = xGetElementById(e);
	    }
	    while (e.hasChildNodes()) {
	        e.removeChild(e.firstChild);
	    }
	    return true;
	};
	
	Document.prototype.insertAfter = function (node, referenceNode) {
		  referenceNode.insertBefore(node, referenceNode.nextSibling);
	};

})(window.node); 
 
(function(node) {
	/*!
	 * GameWindow
	 */
	
	var Player = node.Player;
	var PlayerList = node.PlayerList;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var GameMsgGenerator = node.GameMsgGenerator;
	
	var Document = node.window.Document;
	
	GameWindow.prototype = new Document();
	GameWindow.prototype.constructor = GameWindow;
	
	// The widgets container
	GameWindow.prototype.widgets = {};
	
	function GameWindow() {
		
		if ('undefined' !== typeof node) {
			node.log('nodeWindow: loading...');
			var gsc = node.gsc || null;
			var game = node.game || null;
		}
		else {
			console.log('nodeWindow: nodeGame not found');
		}
		
		Document.call(this);
		this.mainframe = 'mainframe';
		this.root = this.generateRandomRoot();
		
		
		this.state = GameState.iss.LOADED;
		this.areLoading = 0; 
		
		var that = this;
		
		var listeners = function() {
			
			node.on('HIDE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot hide element ' + id);
					return;
				}
				el.style.visibility = 'hidden';    
			});
			
			node.on('SHOW', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot show element ' + id);
					return;
				}
				el.style.visibility = 'visible'; 
			});
			
			node.on('TOGGLE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot toggle element ' + id);
					return;
				}
				if (el.style.visibility === 'visible') {
					el.style.visibility = 'hidden';
				}
				else {
					el.style.visibility = 'visible';
				}
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_DISABLE', function(id) {
				that.toggleInputs(id, true);			
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_ENABLE', function(id) {
				that.toggleInputs(id, false);
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_TOGGLE', function(id) {
				that.toggleInputs(id);
			});
			
			
		}();
	};
	
	// Overriding Document.write and Document.writeln
	GameWindow.prototype._write = Document.prototype.write;
	GameWindow.prototype._writeln = Document.prototype.writeln;
	
	GameWindow.prototype.write = function (text, root) {		
		var root = root || this.frame.body;
		root = root.lastElementChild || root;
		return this._write(root, text);
	};
	
	GameWindow.prototype.writeln = function (text, root, br) {
		var root = root || this.frame.body;
		root = root.lastElementChild || root;
		return this._writeln(root, text, br);
	};
	
	
	/**
	 * Enable / Disable all input in a container with id @id.
	 * If no container with id @id is found, then the whole document is used.
	 * 
	 * If @op is defined, all the input are set to @op, otherwise, the disabled
	 * property is toggled. (i.e. false means enable, true means disable) 
	 * 
	 */
	GameWindow.prototype.toggleInputs = function(id, op) {
		
		var container = this.getElementById(id) || this;			
		if (!container) return;

		var inputTags = ['button', 'select', 'textarea', 'input'];

		var j=0;
		for (;j<inputTags.length;j++) {
			var all = container.getElementsByTagName(inputTags[j]);
			var i=0;
			var max = all.length;
			for (; i < max; i++) {
				//node.log(all[i]);
				
				// If op is defined do that
				var state = op;
				
				// Otherwise toggle
				if (!state) {
					state = all[i].disabled ? false : true;
				}
				
				all[i].disabled = state;
			}
		}
	};
	
	GameWindow.prototype.generateRandomRoot = function () {
		// We assume that the BODY element always exists
		// TODO: Check if body element does not exist and add it
		var root = Math.floor(Math.random()*10000);
		return this.addElement('div', document.body, root);
	};
	
	GameWindow.prototype.generateHeader = function () {
		if (this.header) {
			this.header.innerHTML = '';
			this.header = null;
		}
		
		return this.addElement('div', this.root, 'gn_header');
	};
	
	GameWindow.prototype.setup = function (type){
	
		
		switch (type) {
		
		case 'MONITOR':
			
			// TODO: Check this
			node.node.removeListener('in.STATE');
			
			this.addWidget('NextPreviousState');
			this.addWidget('GameSummary');
			this.addWidget('StateDisplay');
			this.addWidget('StateBar');
			this.addWidget('DataBar');
			this.addWidget('MsgBar');
			this.addWidget('GameBoard');
			this.addWidget('Wall');
	
			break;
		
			
		case 'PLAYER':
			
			//var maincss		= this.addCSS(this.root, 'style.css');
			this.header 	= this.generateHeader();
		    var mainframe 	= this.addIFrame(this.root,'mainframe');
		   

		    this.addWidget('WaitScreen');
		    
			break;
		}
		this.frame = window.frames[this.mainframe]; // there is no document yet
	};
	
	
	GameWindow.prototype.getElementById = function (id) {
		return this.frame.getElementById(id);
	};
	
	GameWindow.prototype.getElementsByTagName = function (tag) {
		return this.frame.getElementsByTagName(tag);
	};
	
	GameWindow.prototype.load = GameWindow.prototype.loadFrame = function (url, func, frame) {
 		
 		this.state = GameState.iss.LOADING;
 		this.areLoading++; // keep track of nested call to loadFrame
 		
		var frame =  frame || this.mainframe;
 		var that = this;	
 				
 		// First add the onload event listener
		var iframe = document.getElementById(frame);
		iframe.onload = function() {
			that.updateStatus(func,frame);
		};
	
		// Then update the frame location
		window.frames[frame].location = url;
 						
 	};
 	
 	
 	GameWindow.prototype.updateStatus = function(func, frame) {
 		// Update the reference to the frame obj
		this.frame = window.frames[frame].document;
			
		if (func) {
    		func.call(node.game); // TODO: Pass the right this reference
    		//console.log('Frame Loaded correctly!');
    	}
			
		this.areLoading--;
		//console.log('ARE LOADING: ' + that.areLoading);
		if (this.areLoading === 0) {
			this.state = GameState.iss.LOADED;
			node.emit('WINDOW_LOADED');
		}
		else {
			console.log('still gw loading');
		}
 	};
 		
	GameWindow.prototype.getFrame = function() {
		return this.frame = window.frames['mainframe'].document;
	};
	
	
	// Header
	
	GameWindow.prototype.addHeader = function (root, id) {
		return this.addDiv(root,id);
	};
	
	/**
	 * Add a widget to the browser window.
	 * TODO: If an already existing id is provided, the existing element is deleted.
	 */
	GameWindow.prototype.addWidget = function (g, root, options) {
		var that = this;
		//console.log(this.widgets);
		
		function appendFieldset(root, options, g) {
			if (!options) return root;
			var idFieldset = options.id || g.id + '_fieldset';
			var legend = options.legend || g.legend;
			return that.addFieldset(root, idFieldset, legend, options.attributes);
		};
		
		// Init default values
		var root = root || this.root;
		var options = options || {};
		
		// TODO: remove the eval
		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		if ('object' !== typeof g) {
			g = JSUS.getNestedValue(g,this.widgets);
			g = new g(options);
			
//			var tokens = g.split('.');
//			var i = 0;
//			var strg = 'g = new this.widgets';
//			for (;i<tokens.length;i++) {
//				strg += '[\''+tokens[i]+'\']';
//			}
//			strg+='(options);';
//			//console.log(strg);
//			eval(strg);
//			//g = new this.widgets[tokens](options);
		}
		
		console.log('nodeWindow: registering gadget ' + g.name + ' v.' +  g.version);
		try {
			// options exists and options.fieldset exist
			var fieldsetOptions = (options && 'undefined' !== typeof options.fieldset) ? options.fieldset : g.fieldset; 
			root = appendFieldset(root,fieldsetOptions,g);
			g.append(root);
			g.listeners();
		}
		catch(e){
			throw 'Error while loading widget ' + g.name + ': ' + e;
		}
		
		return g;
	};
	
	// Recipients
	
	GameWindow.prototype.addRecipientSelector = function (root, id) {
	
		var toSelector = document.createElement('select');
		toSelector.id = id;
	
		root.appendChild(toSelector);
		
		this.addStandardRecipients(toSelector);
		
		//this.toSels.push(toSelector);
		
		return toSelector;
	};
	
	GameWindow.prototype.addStandardRecipients = function (toSelector) {
			
		var opt = document.createElement('option');
		opt.value = 'ALL';
		opt.appendChild(document.createTextNode('ALL'));
		toSelector.appendChild(opt);
		
		var opt = document.createElement('option');
		opt.value = 'SERVER';
		opt.appendChild(document.createTextNode('SERVER'));
		toSelector.appendChild(opt);
		
	
		
	};
	
	GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
		
		if (typeof(playerList) !== 'object' || typeof(toSelector) !== 'object') {
			return;
		}
		
		this.removeChildrenFromNode(toSelector);
		this.addStandardRecipients(toSelector);
		
		
		var opt;
		var pl = new PlayerList(playerList);
		
		
		try {
			pl.forEach( function(p) {
				opt = document.createElement('option');
				opt.value = p.id;
				opt.appendChild(document.createTextNode(p.name));
				toSelector.appendChild(opt);
				}, 
				toSelector);
		}
		catch (e) {
			console.log('(E) Bad Formatted Player List. Discarded. ' + p);
		}
	};
	
	// Actions
	
	
	GameWindow.prototype.addActionSelector = function (root, id) {
	
		var actionSelector = document.createElement('select');
		actionSelector.id = id;
	
		root.appendChild(actionSelector);
		this.populateSelect(actionSelector, node.actions);
		
		return actionSelector;
	};
	
	// States
	
	GameWindow.prototype.addStateSelector = function (root, id) {
		var stateSelector = this.addTextInput(root,id);
		return stateSelector;
	};
	
	
	/**
	 * Expose nodeGame to the global object
	 */	
	node.window = new GameWindow();
	node.window.Document = Document; // Restoring Document constructor
	
})(window.node); 
 
(function(exports) {
	
	/*!
	 * Canvas
	 * 
	 */ 
	
	exports.Canvas = Canvas;
	
	function Canvas(canvas) {

		this.canvas = canvas;
		// 2D Canvas Context 
		this.ctx = canvas.getContext('2d');
		
		this.centerX = canvas.width / 2;
		this.centerY = canvas.height / 2;
		
		this.width = canvas.width;
		this.height = canvas.height;
		
//		console.log(canvas.width);
//		console.log(canvas.height);		
	};
	
	Canvas.prototype = {
				
		constructor: Canvas,
		
		drawOval: function (settings) {
		
			// We keep the center fixed
			var x = settings.x / settings.scale_x;
			var y = settings.y / settings.scale_y;
		
			var radius = settings.radius || 100;
			//console.log(settings);
			//console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
			
			this.ctx.lineWidth = settings.lineWidth || 1;
			this.ctx.strokeStyle = settings.color || '#000000';
			
			this.ctx.save();
			this.ctx.scale(settings.scale_x, settings.scale_y);
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.restore();
		},
		
		drawLine: function (settings) {
		
			var from_x = settings.x;
			var from_y = settings.y;
		
			var length = settings.length;
			var angle = settings.angle;
				
			// Rotation
			var to_x = - Math.cos(angle) * length + settings.x;
			var to_y =  Math.sin(angle) * length + settings.y;
			//console.log('aa ' + to_x + ' ' + to_y);
			
			//console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
			//console.log('Length: ' + length + ', Angle: ' + angle );
			
			this.ctx.lineWidth = settings.lineWidth || 1;
			this.ctx.strokeStyle = settings.color || '#000000';
			
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.moveTo(from_x,from_y);
			this.ctx.lineTo(to_x,to_y);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.restore();
		},
		
		scale: function (x,y) {
			this.ctx.scale(x,y);
			this.centerX = this.canvas.width / 2 / x;
			this.centerY = this.canvas.height / 2 / y;
		},
		
		clear: function() {
			this.ctx.clearRect(0, 0, this.width, this.height);
			// For IE
			var w = this.canvas.width;
			this.canvas.width = 1;
			this.canvas.width = w;
		}
		
	};
})(node.window); 
 
(function(exports){
	
	/*!
	 * 
	 * List: handle list operation
	 * 
	 */
	
	exports.List = List;
	
	function List (options) {
		
		this.id = options.id || 'list';
		
		this.FIRST_LEVEL = 'dl';
		this.SECOND_LEVEL = 'dt';
		this.THIRD_LEVEL = 'dd';
	

		
		this.root = this.createRoot(this.id, options);
		
		this.list = [];
	}
	
	List.prototype.append = function(root) {
		return root.appendChild(this.write());
	};
	
	List.prototype.add = function(elem) {
		this.list.push(elem);
	};
	
	List.prototype.write = function() {
				
		var i = 0;
		var len = list.length;
		for (;i<len;i++) {
			var elem = document.createElement(this.SECOND_LEVEL);
			elem.appendChild(list[i]);
			root.appendChild(elem);
		}
		
		return root;
	};
	
	List.prototype.getRoot = function() {
		return this.root;
	};
	
	List.prototype.createRoot = function(id, options) {
		var root = document.createElement(this.FIRST_LEVEL);
		if (id) {
			root.id = id;
		}

		if (options.attributes) {
			
			node.window.addAttributes2Elem(root, options.attributes);
		}
		
		return root;
	};
	
	List.prototype.createItem = function(id) {
		var item = document.createElement(this.SECOND_LEVEL);
		if (id) {
			item.id = id;
		}
		return item;
	};
	
})(node.window);
 
 
(function(exports){
	
	/*!
	 * 
	 * Table: abstract representation of an HTML table
	 * 
	 */
	var node = exports;
	exports.Table = Table;
	
	// For simple testing
	//module.exports = Table;
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
	
	Table.H = ['x','y','z'];
	Table.V = ['y','x', 'z'];
	
	Table.log = console.log;
	
  function Table (options, data) {
	var options = options || {};
	        
	JSUS.extend(node.NDDB,this);
    node.NDDB.call(this, options, data);  
    
    Table.log = options.log || Table.log;
    this.defaultDim1 = options.defaultDim1 || 'x';
    this.defaultDim2 = options.defaultDim2 || 'y';
    this.defaultDim3 = options.defaultDim3 || 'z';
    
    // Class for missing cells
    this.missing = options.missing || 'missing';
    this.pointers = {
    				x: options.pointerX || 0,
    				y: options.pointerY || 0,
    				z: options.pointerZ || 0
    };
    
    this.id = options.id || 'table';  
    
    this.header = null;
    this.footer = null;
  };
  
  Table.prototype.addClass = function (c) {
	if (!c) return;
	if (c instanceof Array) c = c.join(', ');
	
	this.forEach(function (el) {
		if (!el.className) {
			el.className = c;
		} 
		else {
			el.className += ', ' + c;
		}
	});
	
	return this;
  };

  // Depends on node.window
  Table.prototype.removeClass = function (c) {
	if (!c) return;
	
	if (c instanceof Array) {
		var func = function(el, c) {
			for (var i=0; i< c.length; i++) {
				node.window.removeClass(el, c[i]);
			}
		}
	}
	else {
		var func = node.window.removeClass;
	}
	
	this.forEach(function (el) {
		func.call(this,el,c);
	});
	
	return this;
  };
  
  Table.prototype._addSpecial = function (data, type) {
	if (!data) return;
	var type = type || 'header';
	var out = [];
	for (var i=0; i < data.length; i++) {
		out.push({content: data[i], type: type});
	} 
	return out;
  };
  
  Table.prototype.setHeader = function (header) {
	  this.header = this._addSpecial(header);
  };

  Table.prototype.setFooter = function (footer) {
	  this.footer = this._addSpecial(footer, 'footer');
  };
  
  Table._checkDim123 = function (dims) {
	  var t = Table.H.slice(0);
	  for (var i=0; i< dims.length; i++) {
		  if (!JSUS.removeElement(dims[i],t)) return false;
	  }
	  return true;
  };
  
  /**
   * Updates the reference to the foremost element in the table. 
   * 
   * @param 
   */
  Table.prototype.updatePointer = function (pointer, value) {
	 if (!pointer) return false;
	 if (!JSUS.in_array(pointer, Table.H)) {
		 Table.log('Cannot update invalid pointer: ' + pointer, 'ERR');
		 return false;
	 }
	 
	 if (value > this.pointers[pointer]) {
		 this.pointers[pointer] = value;
		 return true;
	 }
	  
  };
  
  Table.prototype._add = function (data, dims, x, y, z) {
	if (!data) return false;
	if (dims) {
		if (!Table._checkDim123(dims)){
			Table.log('Invalid value for dimensions. Accepted only: x,y,z.')
			return false
		}
	}
	else {
		dims = Table.H;
	}
	
//	console.log('DATA TBL');
//	console.log(data);
	
	// By default, only the second dimension is incremented
	var x = x || this.pointers[dims[0]]; 
	var y = y || this.pointers[dims[1]] + 1;
	var z = z || this.pointers[dims[2]];
	
	if ('object' !== typeof data) data = [data]; 
	
	var insertCell = function (content){	
		//console.log('content');
//		console.log(x + ' ' + y + ' ' + z);
//		console.log(i + ' ' + j + ' ' + h);
		
		var cell = {};
		cell[dims[0]] = i; // i always defined
		cell[dims[1]] = (j) ? y+j : y;
		cell[dims[2]] = (h) ? z+h : z;
		cell['content'] = content;	
		//console.log(cell);
		this.insert(new Cell(cell));
		this.updatePointer(dims[0],cell[dims[0]]);
		this.updatePointer(dims[1],cell[dims[1]]);
		this.updatePointer(dims[2],cell[dims[2]]);
	};
	
	
	var cell = null;
	// Loop Dim1
	for (var i = 0; i < data.length; i++) {
		//console.log('data_i');
		//console.log(data[i]);
		if (data[i] instanceof Array) {
			// Loop Dim2
			for (var j = 0; j < data[i].length; j++) {
//				console.log(data[i]);
				if (data[i][j] instanceof Array) {
//					Table.log(data[i][j]);
//					Table.log(typeof data[i][j]);
					// Loop Dim3
					for (var h = 0; h < data[i][j].length; h++) {
						//console.log('Here h');
						insertCell.call(this, data[i][j][h]);
					}
					h=0; // reset h
				}
				else {
					//console.log('Here j');
					insertCell.call(this, data[i][j]);
				}
			}
			j=0; // reset j
		}
		else {
			//console.log('Here i');
			insertCell.call(this, data[i]);
		}
	}
//	
//	console.log('After insert');
//	console.log(this.db);
	
  };
    
  Table.prototype.addColumn = function (data, attributes, container) {
	if (!data) return false;
	return this._add(data, Table.V);
  };
  
  Table.prototype.addRow = function (data, attributes, container) {
		if (!data) return false;
		return this._add(data, Table.H);
	  };
  
  Table.prototype.getRoot = function() {
    return this.root;
  };
  
  // TODO: Only 2D for now
  // TODO: improve algorithm, rewrite
  Table.prototype.parse = function() {
	  
	  var fromCell2TD = function (cell, el) {
		  if (!cell) return;
		  var el = el || 'td';
		  var TD = document.createElement(el);
		  var c = cell.content;
		  var content = (!JSUS.isNode(c) || !JSUS.isElement(c)) ? document.createTextNode(c) : c;
		  TD.appendChild(content);
		  if (cell.className) TD.className = cell.className;
		  return TD;
	  };
	  
//	  var appendContent = function (td, c) {
//		  if (!td) return;
//		  var content = (!JSUS.isNode(c) || !JSUS.isElement(c)) ? document.createTextNode(c) : c;
//		  td.appendChild(content);
//		  return td;
//	  };
	  
	  var TABLE = document.createElement('table');
	  TABLE.id = this.id;
	  
	  // HEADER
	  if (this.header && this.header.length > 0) {
		  var THEAD = document.createElement('thead');
		  var TR = document.createElement('tr');
		  for (var i=0; i < this.header.length; i++) {
			  TR.appendChild(fromCell2TD(this.header[i]),'th');
		  }
		  THEAD.appendChild(TR);
		  i=0;
		  TABLE.appendChild(THEAD);
	  }
	  
	  // BODY
	  if (this.size() !==  0) {
		  var TBODY = document.createElement('tbody');
	  
		  this.sort(['y','x']); // z to add first
		  var trid = -1;
		  // TODO: What happens if the are missing at the beginning ??
		  var f = this.first();
		  var old_x = f.x;

		  for (var i=0; i < this.db.length; i++) {
			  if (trid !== this.db[i].y) {
				  var TR = document.createElement('tr');
				  TBODY.appendChild(TR);
				  trid = this.db[i].y;
				  //console.log(trid);
				  old_x = f.x - 1; // must start exactly from the first
			  }
			  
			  // Insert missing cells
			  if (this.db[i].x > old_x + 1) {
				  var diff = this.db[i].x - (old_x + 1);
				  for (var j=0; j < diff; j++ ) {
					  var TD = document.createElement('td');
					  TD.className = this.missing;
					  TR.appendChild(TD);
				  }
			  }
			  // Normal Insert
			  TR.appendChild(fromCell2TD(this.db[i]));
			  
			  // Update old refs
			  old_x = this.db[i].x;
		  }
		  TABLE.appendChild(TBODY);
	  }
	 
	  
	  //FOOTER
	  if (this.footer && this.footer.length > 0) {
		  var TFOOT = document.createElement('tfoot');
		  var TR = document.createElement('tr');
		  for (var i=0; i < this.header.length; i++) {
			  TR.appendChild(fromCell2TD(this.footer[i]));
		  }
		  TFOOT.appendChild(TR);
		  TABLE.appendChild(TFOOT);
	  }
	  
	  return TABLE;
  }
  
  // Cell Class
  
  function Cell (cell){
	  
	  this.x = ('undefined' !== typeof cell.x) ? cell.x : null;
	  this.y = ('undefined' !== typeof cell.y) ? cell.y : null;
	  this.z = ('undefined' !== typeof cell.z) ? cell.z : null;
	  
	  this.content = ('undefined' !== typeof cell.content) ? cell.content : '';
	  this.className = ('undefined' !== typeof cell.style) ? cell.style : null;
  };
  
	
})(('undefined' !== typeof node) ? node : module.parent.exports);
 
 
 
 
 
 
/*!
 * nodeGadgets v0.6.5
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Sun Jan 8 15:30:55 CET 2012
 *
 */
 
 
(function (exports, JSUS) {
	/*!
	 * ChernoffFaces
	 * 
	 * Parametrically display Chernoff Faces
	 * 
	 */
		
	/**
	 * Expose constructor
	 */
	exports.ChernoffFaces = ChernoffFaces;
	
	ChernoffFaces.defaults = {};
	ChernoffFaces.defaults.canvas = {};
	ChernoffFaces.defaults.canvas.width = 100;
	ChernoffFaces.defaults.canvas.heigth = 100;
	
	function ChernoffFaces(options) {
		var options = options || {};
		
		this.game = node.game;
		this.id = options.id || 'ChernoffFaces';
		this.name = 'Chernoff Faces';
		this.version = '0.3';
		
		//this.fieldset = { id: this.id, legend: this.name};
		
		this.bar = null;
		this.root = null;
		
		this.sc = null; // Slider Controls
		this.fp = null; // Face Painter
		
		this.dims = {
					width: (options.width) ? options.width : ChernoffFaces.defaults.canvas.width, 
					height:(options.height) ? options.height : ChernoffFaces.defaults.canvas.heigth
		};
		
		this.features = options.features;
		this.change = options.change || 'CF_CHANGE';
		this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;
		this.options = options;
	};
	
	ChernoffFaces.prototype.getRoot = function() {
		return this.root;
	};
	
	ChernoffFaces.prototype.init = function(options) {
//		var PREF = this.id + '_';
//		var ids = options.ids || {};
//		
//		var idFieldset = PREF + 'fieldset'; 
//		var idCanvas = PREF + 'canvas';
//		var idButton = PREF + 'button';
//	
//		
//		// var fieldset = node.window.addFieldset(root, , , {style: 'float:left'});
//		
//		if (ids !== null && ids !== undefined) {
//			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
//			if (ids.hasOwnProperty('canvas')) idCanvas = ids.canvas;
//			if (ids.hasOwnProperty('button')) idButton = ids.button;
//		}
//		
//		
//		var canvas = node.window.addCanvas(root, idCanvas, this.dims);
//		this.fp = new FacePainter(canvas);		
//		this.fp.draw(new FaceVector(this.features));
//		
//		if (this.controls) {
//			//var fieldset = node.window.addFieldset(root, , , {style: 'float:left'});
//			
//			var sc_options = {
//								id: 'cf_controls',
//								features: Utils.mergeOnValue(FaceVector.defaults, this.features),
//								change: this.change,
//								fieldset: {id: idFieldset, 
//										   legend: 'Chernoff Box',
//										   attributes: {style: 'float:left'}
//								},
//								//attributes: {style: 'float:left'},
//								submit: 'Send'
//			};
//			
//			this.sc = node.window.addWidget('Controls.Slider', root, sc_options);
//		}
//
//		this.root = root;
//		return root;
		
	};
	
	ChernoffFaces.prototype.getHTML = function() {
		var d = document.createElement('div');
		this.append(d);
		return d.innerHTML;
	};
	
	ChernoffFaces.prototype.append = function (root, ids) {
		
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset'; 
		var idCanvas = PREF + 'canvas';
		var idButton = PREF + 'button';
	
		
		// var fieldset = node.window.addFieldset(root, , , {style: 'float:left'});
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('canvas')) idCanvas = ids.canvas;
			if (ids.hasOwnProperty('button')) idButton = ids.button;
		}
		
		
		var canvas = node.window.addCanvas(root, idCanvas, this.dims);
		this.fp = new FacePainter(canvas);		
		this.fp.draw(new FaceVector(this.features));
		
		if (this.controls) {
			//var fieldset = node.window.addFieldset(root, , , {style: 'float:left'});
			
			var sc_options = {
								id: 'cf_controls',
								features: Utils.mergeOnValue(FaceVector.defaults, this.features),
								change: this.change,
								fieldset: {id: idFieldset, 
										   legend: 'Chernoff Box',
										   attributes: {style: 'float:left'}
								},
								//attributes: {style: 'float:left'},
								submit: 'Send'
			};
			
			this.sc = node.window.addWidget('Controls.Slider', root, sc_options);
		}

		this.root = root;
		return root;
		
	};
	
	ChernoffFaces.prototype.listeners = function () {
		var that = this;
		
		node.on(that.change, function(msg) {
			var fv = new FaceVector(that.sc.getAllValues());
			that.fp.redraw(fv);
		}); 
	};
	
	
	ChernoffFaces.prototype.getAllValues = function() {
		return this.sc.getAllValues();
	};
	
	ChernoffFaces.prototype.randomize = function() {
		var fv = FaceVector.random();
		this.fp.redraw(fv);
		this.sc.init({features: Utils.mergeOnValue(FaceVector.defaults, fv)});
		this.sc.refresh();
		return true;
	};
	
	/*!
	* ChernoffFaces
	* 
	* Parametrically display Chernoff Faces
	* 
	*/
	
	function FacePainter (canvas, settings) {
			
		this.canvas = new node.window.Canvas(canvas);
		
		this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
		this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
	};
	
	//Draws a Chernoff face.
	FacePainter.prototype.draw = function (face, x, y) {
		if (!face) return;
		
		this.fit2Canvas(face);
		this.canvas.scale(face.scaleX, face.scaleY);
		
		//console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
		
		var x = x || this.canvas.centerX;
		var y = y || this.canvas.centerY;
		
		this.drawHead(face, x, y);
			
		this.drawEyes(face, x, y);
	
		this.drawPupils(face, x, y);
	
		this.drawEyebrow(face, x, y);
	
		this.drawNose(face, x, y);
		
		this.drawMouth(face, x, y);
		
	};		
		
	FacePainter.prototype.redraw = function (face, x, y) {
		this.canvas.clear();
		this.draw(face,x,y);
	}
	
	FacePainter.prototype.scale = function (x, y) {
		this.canvas.scale(this.scaleX, this.scaleY);
	}
	
	// TODO: Improve. It eats a bit of the margins
	FacePainter.prototype.fit2Canvas = function(face) {
		if (!this.canvas) {
		console.log('No canvas found');
			return;
		}
		
		if (this.canvas.width > this.canvas.height) {
			var ratio = this.canvas.width / face.head_radius * face.head_scale_x;
		}
		else {
			var ratio = this.canvas.height / face.head_radius * face.head_scale_y;
		}
		
		face.scaleX = ratio / 2;
		face.scaleY = ratio / 2;
	}
	
	FacePainter.prototype.drawHead = function (face, x, y) {
		
		var radius = face.head_radius;
		
		this.canvas.drawOval({
					   x: x, 
					   y: y,
					   radius: radius,
					   scale_x: face.head_scale_x,
					   scale_y: face.head_scale_y,
					   color: face.color,
					   lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawEyes = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		var spacing = face.eye_spacing;
			
		var radius = face.eye_radius;
		//console.log(face);
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
						
		});
		//console.log(face);
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	}
	
	FacePainter.prototype.drawPupils = function (face, x, y) {
			
		var radius = face.pupil_radius;
		var spacing = face.eye_spacing;
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
		
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	
	};
	
	FacePainter.prototype.drawEyebrow = function (face, x, y) {
		
		var height = FacePainter.computeEyebrowOffset(face,y);
		var spacing = face.eyebrow_spacing;
		var length = face.eyebrow_length;
		var angle = face.eyebrow_angle;
		
		this.canvas.drawLine({
						x: x - spacing,
						y: height,
						length: length,
						angle: angle,
						color: face.color,
						lineWidth: face.lineWidth
					
						
		});
		
		this.canvas.drawLine({
						x: x + spacing,
						y: height,
						length: 0-length,
						angle: -angle,	
						color: face.color,
						lineWidth: face.lineWidth
		});
		
	};
	
	FacePainter.prototype.drawNose = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
		var nastril_r_x = x + face.nose_width / 2;
		var nastril_r_y = height + face.nose_length;
		var nastril_l_x = nastril_r_x - face.nose_width;
		var nastril_l_y = nastril_r_y; 
		
		this.canvas.ctx.lineWidth = face.lineWidth;
		this.canvas.ctx.strokeStyle = face.color;
		
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x,height);
		this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
		this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
		//this.canvas.ctx.closePath();
		this.canvas.ctx.stroke();
		this.canvas.ctx.restore();
	
	};
			
	FacePainter.prototype.drawMouth = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
		var startX = x - face.mouth_width / 2;
	    var endX = x + face.mouth_width / 2;
		
		var top_y = height - face.mouth_top_y;
		var bottom_y = height + face.mouth_bottom_y;
		
		// Upper Lip
		this.canvas.ctx.moveTo(startX,height);
	    this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
	    this.canvas.ctx.stroke();
		
	    //Lower Lip
	    this.canvas.ctx.moveTo(startX,height);
	    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
	    this.canvas.ctx.stroke();
	   
	};	
	
	
	//TODO Scaling ?
	FacePainter.computeFaceOffset = function (face, offset, y) {
		var y = y || 0;
		//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
		var pos = y - face.head_radius + face.head_radius * 2 * offset;
		//console.log('POS: ' + pos);
		return pos;
	};
	
	FacePainter.computeEyebrowOffset = function (face, y) {
		var y = y || 0;
		var eyemindistance = 2;
		return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
	};
	
	
	/*!
	* 
	* A description of a Chernoff Face.
	*
	* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
	* describe a Chernoff face.  
	*
	*/

	
	FaceVector.defaults = {
			// Head
			head_radius: {
				// id can be specified otherwise is taken head_radius
				min: 10,
				max: 100,
				step: 0.01,
				value: 30,
				label: 'Face radius'
			},
			head_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.5,
				label: 'Scale head horizontally'
			},
			head_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale head vertically'
			},
			// Eye
			eye_height: {
				min: 0.1,
				max: 0.9,
				step: 0.01,
				value: 0.4,
				label: 'Eye height'
			},
			eye_radius: {
				min: 2,
				max: 30,
				step: 0.01,
				value: 5,
				label: 'Eye radius'
			},
			eye_spacing: {
				min: 0,
				max: 50,
				step: 0.01,
				value: 10,
				label: 'Eye spacing'
			},
			eye_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes horizontally'
			},
			eye_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes vertically'
			},
			// Pupil
			pupil_radius: {
				min: 1,
				max: 9,
				step: 0.01,
				value: 1,  //this.eye_radius;
				label: 'Pupil radius'
			},
			pupil_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils horizontally'
			},
			pupil_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils vertically'
			},
			// Eyebrow
			eyebrow_length: {
				min: 1,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Eyebrow length'
			},
			eyebrow_eyedistance: {
				min: 0.3,
				max: 10,
				step: 0.01,
				value: 3, // From the top of the eye
				label: 'Eyebrow from eye'
			},
			eyebrow_angle: {
				min: -2,
				max: 2,
				step: 0.01,
				value: -0.5,
				label: 'Eyebrow angle'
			},
			eyebrow_spacing: {
				min: 0,
				max: 20,
				step: 0.01,
				value: 5,
				label: 'Eyebrow spacing'
			},
			// Nose
			nose_height: {
				min: 0.4,
				max: 1,
				step: 0.01,
				value: 0.4,
				label: 'Nose height'
			},
			nose_length: {
				min: 0.2,
				max: 30,
				step: 0.01,
				value: 15,
				label: 'Nose length'
			},
			nose_width: {
				min: 0,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Nose width'
			},
			// Mouth
			mouth_height: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.75, 
				label: 'Mouth height'
			},
			mouth_width: {
				min: 2,
				max: 100,
				step: 0.01,
				value: 20,
				label: 'Mouth width'
			},
			mouth_top_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: -2,
				label: 'Upper lip'
			},
			mouth_bottom_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: 20,
				label: 'Lower lip'
			}					
	};
	
	//Constructs a random face vector.
	FaceVector.random = function () {
	  var out = {};
	  for (var key in FaceVector.defaults) {
	    if (FaceVector.defaults.hasOwnProperty(key)) {
	      if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
	        out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
	      }
	    }
	  }
	  
	  out.scaleX = 1;
	  out.scaleY = 1;
	  
	  out.color = 'green';
	  out.lineWidth = 1; 
	  
	  return new FaceVector(out);
	};
	
	function FaceVector (faceVector) {
		  var faceVector = faceVector || {};

		this.scaleX = faceVector.scaleX || 1;
		this.scaleY = faceVector.scaleY || 1;


		this.color = faceVector.color || 'green';
		this.lineWidth = faceVector.lineWidth || 1;
		  
		  // Merge on key
		 for (var key in FaceVector.defaults) {
		   if (FaceVector.defaults.hasOwnProperty(key)){
		     if (faceVector.hasOwnProperty(key)){
		       this[key] = faceVector[key];
		     }
		     else {
		       this[key] = FaceVector.defaults[key].value;
		     }
		   }
		 }
		  
		};

	//Constructs a random face vector.
	FaceVector.prototype.shuffle = function () {
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				if (FaceVector.defaults.hasOwnProperty(key)) {
					if (key !== 'color') {
						this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
						
					}
				}
			}
		}
	};
	
	//Computes the Euclidean distance between two FaceVectors.
	FaceVector.prototype.distance = function (face) {
		return FaceVector.distance(this,face);
	};
		
		
	FaceVector.distance = function (face1, face2) {
		var sum = 0.0;
		var diff;
		
		for (var key in face1) {
			if (face1.hasOwnProperty(key)) {
				diff = face1[key] - face2[key];
				sum = sum + diff * diff;
			}
		}
		
		return Math.sqrt(sum);
	};
	
	FaceVector.prototype.toString = function() {
		var out = 'Face: ';
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				out += key + ' ' + this[key];
			}
		};
		return out;
	};

})(node.window.widgets, node.JSUS); 
 
 
 
(function (exports) {
	

	/**
	 * Controls
	 * 
	 */
	
	exports.Controls = Controls;	
	exports.Controls.Slider = SliderControls;
	exports.Controls.Radio	= RadioControls;
	
		
	function Controls (options) {
		this.name = 'Controls'
		this.version = '0.2';
	

		this.options = options;
		this.id = options.id || this.name;
		this.root = null;
		
		this.listRoot = null;
		this.fieldset = null;
		this.submit = null;
		
		this.init(options);
	};

	Controls.prototype.add = function (root, id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.addTextInput(root, id, attributes);
	};
	
	Controls.prototype.init = function (options) {
		
//		if (options.fieldset) {
//			this.list = new node.window.List();
//		}
//		else {		
//			this.list = new node.window.List(this.id);
//		}
		this.hasChanged = false; // TODO: should this be inherited?
		this.changeEvent = options.change || this.id + '_change';
		this.list = new node.window.List(options);
		this.listRoot = this.list.getRoot();
		
		if (!options.features) return;
		
		this.features = options.features;
		this.populate();
	};
	
	Controls.prototype.append = function (root) {
		this.root = root;
		var toReturn = this.listRoot;
		
//		if (this.options.fieldset) {
//			var idFieldset = this.options.fieldset.id || this.id;
//			var legend = this.options.fieldset.legend || 'Input';
//			var attributes = this.options.fieldset.attributes || {}; 
//			this.fieldset = node.window.addFieldset(this.root, idFieldset, legend, attributes);
//			// Updating root and return element
//			root = this.fieldset;
//			toReturn = this.fieldset;
//		}
		
		root.appendChild(this.listRoot);
		
		if (this.options.submit) {
			var idButton = 'submit_' + this.id;
			if (this.options.submit.id) {
				var idButton = this.options.submit.id;
				delete this.options.submit.id;
			}
			this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);
			
			var that = this;
			this.submit.onclick = function() {
				if (that.options.change) {
					node.emit(that.options.change);
				}
			};
		}		
		
		return toReturn;
	};
	
	
	Controls.prototype.populate = function () {
		var that = this;
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					var id = attributes.id;
					delete attributes.id;
				}
				
				var item = this.list.createItem();
				this.listRoot.appendChild(item);
					
				// Add a different element according to the subclass instantiated
				var elem = this.add(item, id, attributes);
				
				// Fire the onChange event, if one defined
				if (this.changeEvent) {
					elem.onchange = function() {
						node.emit(that.changeEvent);
					};
				}
				
				// If a label element is present it checks whether it is an
				// object literal or a string.
				// In the former case it scans the obj for additional properties
//				if (attributes.label) {
//					var labelId = 'label_' + id;
//					var labelText = attributes.label;
//					
//					if (typeof(attributes.label) === 'object') {
//						var labelText = attributes.label.text;
//						if (attributes.label.id) {
//							labelId = attributes.label.id; 
//						}
//					}	
//					node.window.addLabel(elem, labelId, labelText, id);
//				}
			}
		}
	};
	
	Controls.prototype.listeners = function() {	
		var that = this;
		// TODO: should this be inherited?
		node.on(this.changeEvent, function(){
			that.hasChanged = true;
		});
				
	};

	Controls.prototype.refresh = function() {
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					el.value = this.features[key].value;
					// TODO: set all the other attributes
					// TODO: remove/add elements
				}
				
			}
		}
		
		return true;
	};
	
	Controls.prototype.getAllValues = function() {
		var out = {};
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					out[key] = Number(el.value);
				}
				
			}
		}
		
		return out;
	};
	
	Controls.prototype.highlight = function (code) {
		return node.window.highlight(this.listRoot, code);
	};
	
	// Sub-classes
	
	SliderControls.prototype.__proto__ = Controls.prototype;
	SliderControls.prototype.constructor = SliderControls;
	
	function SliderControls (options) {
		Controls.call(this,options);
		this.name = 'SliderControls'
		this.version = '0.2';
		this.id = options.id || this.name;
	};
	
	SliderControls.prototype.add = function (root, id, attributes) {
		return node.window.addSlider(root, id, attributes);
	};
	
	RadioControls.prototype.__proto__ = Controls.prototype;
	RadioControls.prototype.constructor = RadioControls;
	
	function RadioControls (options) {
		Controls.call(this,options);
		this.name = 'RadioControls'
		this.version = '0.1.1';
		this.id = options.id || this.name;
		this.groupName = options.name || Math.floor(Math.random(0,1)*10000); 
		//alert(this.groupName);
	};
	
	RadioControls.prototype.add = function (root, id, attributes) {
		console.log('ADDDING radio');
		console.log(attributes);
		// add the group name if not specified
		if ('undefined' === typeof attributes.name) {
			console.log(this);
			console.log('MODMOD ' + this.groupName);
			attributes.name = 'asdasd'; //this.groupName;
		}
		console.log(attributes);
		return node.window.addRadioButton(root, id, attributes);	
	};
	
	// Override getAllValues for Radio Controls
	RadioControls.prototype.getAllValues = function() {
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el.checked) {
					return el.value;
				}
			}
		}
		return false;
	};
	
})(node.window.widgets); 
 
 
 
(function (exports) {
	
	
	/*
	 * DataBar
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.DataBar	= DataBar;
		
	function DataBar(id) {
		
		this.game = node.game;
		this.id = id || 'databar';
		this.name = 'Data Bar';
		this.version = '0.2.1';
		
		this.bar = null;
		this.root = null;
		
		this.recipient = null;
	};
	
	DataBar.prototype.append = function (root, ids) {
		
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset'; 
		var idButton = PREF + 'sendButton';
		var idData = PREF + 'dataText';
		var idRecipient = PREF + 'recipient'; 
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('button')) idButton = ids.button;
			if (ids.hasOwnProperty('data')) idData = ids.data;
			if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
		}
		
		var fieldset = node.window.addFieldset(root, idFieldset, 'Send Data to Players');
		var sendButton = node.window.addButton(fieldset, idButton);
		var dataInput = node.window.addTextInput(fieldset, idData);
		
		this.recipient = node.window.addRecipientSelector(fieldset, idRecipient);
		
		
		
		var that = this;
	
		sendButton.onclick = function() {
			
			var to = that.recipient.value;
	
			//try {
				//var data = JSON.parse(dataInput.value);
				data = dataInput.value;
				console.log('Parsed Data: ' + JSON.stringify(data));
				
				node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
	//			}
	//			catch(e) {
	//				console.log('Impossible to parse the data structure');
	//			}
		};
		
		return fieldset;
		
	};
	
	DataBar.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
				node.window.populateRecipientSelector(that.recipient,msg.data);
			}); 
	};
	
})(node.window.widgets); 
 
 
 
(function (exports) {
	
	/*!
	 * GameBoard
	 */ 
	
	exports.GameBoard = GameBoard;
	
	GameState = node.GameState;
	PlayerList = node.PlayerList;
		
	function GameBoard (id) {
		
		this.game = node.game;
		this.id = id || 'gboard';
		this.name = 'GameBoard';
		
		this.version = '0.3';
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
	}
	
	GameBoard.prototype.append = function(root) {
		this.root = root;
		var fieldset = node.window.addFieldset(root, this.id + '_fieldset', 'Game State');
		this.board = node.window.addDiv(fieldset,this.id);
		this.updateBoard(node.game.pl);
		
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		
		node.on('UPDATED_PLIST', function () {
			console.log('I Updating Board');
			that.updateBoard(node.game.pl);

		});
		
//		node.onPLIST( function (msg) {
//			console.log('I Updating Board ' + msg.text);
//			that.updateBoard(msg.data);
//		});
	};
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		that.board.innerHTML = 'Updating...';

		//console.log(pl);
		
		if (pl.size() !== 0) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//console.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = p.state.state + '.' + p.state.step + ':' + p.state.round; 
				pState += ' ';
				
				switch (p.state.is) {

					case GameState.iss.UNKNOWN:
						pState += '(unknown)';
						break;
						
					case GameState.iss.LOADING:
						pState += '(loading)';
						break;
						
					case GameState.iss.LOADED:
						pState += '(loaded)';
						break;
						
					case GameState.iss.PLAYING:
						pState += '(playing)';
						break;
					case GameState.iss.DONE:
						pState += '(done)';
						break;		
					default:
						pState += '('+p.state.is+')';
						break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
			//this.board.innerHTML = pl.toString('<hr style="color: #CCC;"/>');
		}
		else {
			that.board.innerHTML = that.noPlayers;
		}
	}
	
})(node.window.widgets); 
 
 
 
(function (exports) {

	
	/*!
	 * GameSummary
	 * 
	 * Show Game Info
	 */
	
	exports.GameSummary	= GameSummary;
	
	function GameSummary(id) {
		//debugger;
		this.game = node.game;
		this.id = id || 'gamesummary';
		this.name = 'Game Summary';
		this.version = '0.2.1';
		
		this.fieldset = null;
		this.summaryDiv = null;
	}
	
	
	GameSummary.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idSummary = PREF + 'player';
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('player')) idSummary = ids.player;
		}
		
		this.fieldset = node.window.addFieldset(root, idFieldset, 'Game Summary');
		
		
		this.summaryDiv = node.window.addDiv(this.fieldset,idSummary);
		
		
		that.writeSummary();
			
		return this.fieldset;
		
	};
	
	GameSummary.prototype.writeSummary = function(idState,idSummary) {
		var gName = document.createTextNode('Name: ' + this.game.name);
		var gDescr = document.createTextNode('Descr: ' + this.game.description);
		var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
		var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.fieldset,this.summaryDiv,idSummary);
	};
	
	GameSummary.prototype.listeners = function() {}; 

})(node.window.widgets); 
 
 
 
(function (exports) {

	
	/*!
	 * MsgBar
	 * 
	 */
	
	exports.MsgBar	= MsgBar;
		
	function MsgBar(id){
		
		this.game = node.game;
		this.id = id || 'msgbar';
		this.name = 'Msg Bar';
		this.version = '0.2.1';
		
		this.recipient = null;
	}
	
	MsgBar.prototype.append = function (root, ids) {
		
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset'; 
		var idButton = PREF + 'sendButton';
		var idMsgText = PREF + 'msgText';
		var idRecipient = PREF + 'recipient'; 
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('button')) idButton = ids.button;
			if (ids.hasOwnProperty('msgText')) idMsgText = ids.msgText;
			if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
		}
		
		var fieldset = node.window.addFieldset(root, idFieldset, 'Send Msg To Players');
		var sendButton = node.window.addButton(fieldset, idButton);
		var msgText = node.window.addTextInput(fieldset, idMsgText);
		this.recipient = node.window.addRecipientSelector(fieldset, idRecipient);
		
		var that = this;
		
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			var msg = node.TXT(msgText.value,to);
			//console.log(msg.stringify());
		};
	
		return fieldset;
		
	};
	
	MsgBar.prototype.listeners = function(){
		var that = this;
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
			// was
			//that.game.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	};
})(node.window.widgets); 
 
 
 
(function (exports) {
	
	/*!
	 * NextPreviousState
	 * 
	 * Step back and forth in the gameState
	 * 
	 */
	
	exports.NextPreviousState =	NextPreviousState;
		
	function NextPreviousState(id) {
		this.game = node.game;
		this.id = id || 'nextprevious';
		this.name = 'Next,Previous State';
		this.version = '0.2.1';
		
	}
	
	NextPreviousState.prototype.append = function (root, ids) {
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset'; 
		var idFwd = PREF + 'sendButton';
		var idRew = PREF + 'stateSel';
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('fwd')) idFwd = ids.fwd;
			if (ids.hasOwnProperty('rew')) idRew = ids.rew;
		}
		
		var fieldset 	= node.window.addFieldset(root, idFieldset, 'Rew-Fwd');
		var rew 		= node.window.addButton(fieldset, idRew, '<<');
		var fwd 		= node.window.addButton(fieldset, idFwd, '>>');
		
		
		var that = this;
	
		fwd.onclick = function() {
			
			var state = that.game.next();
			
			if (state) {
				var stateEvent = node.OUT + node.actions.SET + '.STATE';
				//var stateEvent = 'out.' + action + '.STATE';
				node.fire(stateEvent,state,'ALL');
			}
			else {
				console.log('No next state. Not sent.');
				node.gsc.sendTXT('E: no next state. Not sent');
			}
		};
	
		rew.onclick = function() {
			
			var state = that.game.previous();
			
			if (state) {
				var stateEvent = node.OUT + node.actions.SET + '.STATE';
				//var stateEvent = 'out.' + action + '.STATE';
				node.fire(stateEvent,state,'ALL');
			}
			else {
				console.log('No previous state. Not sent.');
				node.gsc.sendTXT('E: no previous state. Not sent');
			}
		};
		
		
		return fieldset;
	};
	
	NextPreviousState.prototype.listeners = function () {}; 

})(node.window.widgets); 
 
 
 
(function (exports) {
	
	/*
	 * StateBar
	 * 
	 * Sends STATE msgs
	 */
	
	exports.StateBar = StateBar;	
		
	function StateBar(id) {
		
		this.game = node.game;;
		this.id = id || 'statebar';
		this.name = 'State Bar';
		this.version = '0.2.1';
		
		this.actionSel = null;
		this.recipient = null;
	}
	
	StateBar.prototype.append = function (root, ids) {
		
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset'; 
		var idButton = PREF + 'sendButton';
		var idStateSel = PREF + 'stateSel';
		var idActionSel = PREF + 'actionSel';
		var idRecipient = PREF + 'recipient'; 
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('button')) idButton = ids.button;
			if (ids.hasOwnProperty('state')) idStateSel = ids.idStateSel;
			if (ids.hasOwnProperty('action')) idActionSel = ids.idActionSel;
			if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
		}
		
		var fieldset 	= node.window.addFieldset(root, idFieldset, 'Change Game State');
		var sendButton 	= node.window.addButton(fieldset, idButton);
		var stateSel 	= node.window.addStateSelector(fieldset, idStateSel);
		this.actionSel	= node.window.addActionSelector(fieldset, idActionSel);
		this.recipient 	= node.window.addRecipientSelector(fieldset, idRecipient);
		
		var that = this;
	
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			
			//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
			//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
			//var parseState = /^(\d+)$/;
			//var parseState = /(\S+)?/;
			var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
			
			var result = parseState.exec(stateSel.value);
			
			if (result !== null) {
				// Note: not result[0]!
				var state = result[1];
				var step = result[2] || 1;
				var round = result[3] || 1;
				console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
				
				var state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				var stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.fire(stateEvent,state,to);
			}
			else {
				console.log('Not valid state. Not sent.');
				node.gsc.sendTXT('E: not valid state. Not sent');
			}
		};
	
		return fieldset;
		
	};
	
	StateBar.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		node.onPLIST( function(msg) {
			
			node.window.populateRecipientSelector(that.recipient,msg.data);
			// was
			//that.game.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	}; 
})(node.window.widgets); 
 
 
 
(function (exports) {
	

	/*
	 * StateDisplay
	 * 
	 * Sends STATE msgs
	 */
	
	exports.StateDisplay = StateDisplay;	
		
	function StateDisplay(id) {
		
		this.game = node.game;
		this.id = id || 'statedisplay';
		this.name = 'State Display';
		this.version = '0.2.1';
		
		this.fieldset = null;
		this.stateDiv = null;
	}
	
	
	StateDisplay.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idPlayer = PREF + 'player';
		var idState = PREF + 'state'; 
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('player')) idPlayer = ids.player;
			if (ids.hasOwnProperty('state')) idState = ids.state;
		}
		
		this.fieldset = node.window.addFieldset(root, idFieldset, 'Player Status');
		
		
		this.playerDiv = node.window.addDiv(this.fieldset,idPlayer);
		
		var checkPlayerName = setInterval(function(idState,idPlayer){
				if(that.game.player !== null){
					clearInterval(checkPlayerName);
					that.updateAll();
				}
			},100);
	
		return this.fieldset;
		
	};
	
	StateDisplay.prototype.updateAll = function(idState,idPlayer) {
		var pName = document.createTextNode('Name: ' + this.game.player.name);
		var pId = document.createTextNode('Id: ' + this.game.player.id);
		
		this.playerDiv.appendChild(pName);
		this.playerDiv.appendChild(document.createElement('br'));
		this.playerDiv.appendChild(pId);
		
		this.stateDiv = node.window.addDiv(this.playerDiv,idState);
		this.updateState(this.game.gameState);
	};
	
	StateDisplay.prototype.updateState =  function(state) {
		if (!state) return;
		var that = this;
		var checkStateDiv = setInterval(function(){
			if(that.stateDiv){
				clearInterval(checkStateDiv);
				that.stateDiv.innerHTML = 'State: ' +  state.toString() + '<br />';
				// was
				//that.stateDiv.innerHTML = 'State: ' +  GameState.stringify(state) + '<br />';
			}
		},100);
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on( 'STATECHANGE', function(state) {
			that.updateState(state);
		}); 
	}; 
})(node.window.widgets); 
 
 
 
(function (exports) {
	
	
	/*
	 * VisualState
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualState	= VisualState;
	
	GameState = node.GameState;
	Utils = node.Utils;
	
	function VisualState (options) {
		this.game = node.game;
		this.id = options.id || 'VisualState';
		this.name = 'Visual State';
		this.version = '0.1';
		this.gameLoop = node.game.gameLoop;
		
		this.fieldset = {legend: 'State'};
		
		this.root = null;		// the parent element
		
		//this.init(options);
	};
	
	VisualState.prototype.init = function (options) {};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idTimerDiv = PREF + 'div';
		

		this.stateDiv = node.window.addDiv(root,idTimerDiv);
		this.stateDiv.innerHTML = 'Uninitialized'; //new GameState(this.game.gameState);
		
		return root;
		
	};
	
	VisualState.prototype.start = function() {
		var that = this;
		// Init Timer
		var time = Utils.parseMilliseconds(this.milliseconds);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
		
		
		this.timer = setInterval(function() {
			that.timePassed = that.timePassed + that.update;
			var time = that.milliseconds - that.timePassed;

			if (time <= 0) {
				if (that.event) {
					node.emit(that.event);
				}
				clearInterval(that.timer);
				time = 0;
			}
			//console.log(time);
			time = Utils.parseMilliseconds(time);
			that.timerDiv.innerHTML = time[2] + ':' + time[3];
			
		}, this.update);
	};
	
	VisualState.prototype.restart = function(options) {
		this.init(options);
		this.start();
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;

		
		node.on('STATECHANGE', function() {
			that.writeState(that.game.gameState);
		}); 
	};
	
	VisualState.prototype.writeState = function (state) {
		this.stateDiv.innerHTML =  this.gameLoop.getName(state);
	};
	
})(node.window.widgets); 
 
 
 
(function (exports) {
	
	
	/*
	 * VisualTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualTimer	= VisualTimer;
	
	Utils = node.Utils;
	
	function VisualTimer (options) {
		var options = options || {};
		
		this.game = node.game;
		this.id = options.id || 'VisualTimer';
		this.name = 'Visual Timer';
		this.version = '0.3.2';
		
		this.timer = null; 		// the ID of the interval
		this.timerDiv = null; 	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = { legend: 'Time to go',
						  id: this.id + '_fieldset'
		};
		
		this.init(options);
	};
	
	VisualTimer.prototype.init = function (options) {
		if (this.timer) clearInterval(this.timer);
		this.milliseconds = options.milliseconds || 0;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.text = options.text || 'Time to go';
		this.event = options.event || 'TIMEUP'; // event to be fire		
		// TODO: update and milliseconds must be multiple now
	};
	
	VisualTimer.prototype.append = function (root) {
		var that = this;
//		var PREF = this.id + '_';
//		
//		var idFieldset = PREF + 'fieldset';
//		var idTimerDiv = PREF + 'div';
//		
//		if (ids !== null && ids !== undefined) {
//			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
//		}
//		
//		var fieldset = node.window.addFieldset(root, idFieldset, this.text);
		
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
			
		this.start();
		
		return root;
		
	};
	
	VisualTimer.prototype.start = function() {
		if (!this.milliseconds || this.milliseconds === 0){
			this.timerDiv.innerHTML = '0:0';
			return;
		}
		var that = this;
		// Init Timer
		var time = Utils.parseMilliseconds(this.milliseconds);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
		
		
		this.timer = setInterval(function() {
			that.timePassed = that.timePassed + that.update;
			var time = that.milliseconds - that.timePassed;

			if (time <= 0) {
				if (that.event) {
					node.emit(that.event);
				}
				clearInterval(that.timer);
				time = 0;
			}
			//console.log(time);
			time = Utils.parseMilliseconds(time);
			that.timerDiv.innerHTML = time[2] + ':' + time[3];
			
		}, this.update);
	};
	
	VisualTimer.prototype.restart = function(options) {
		this.init(options);
		this.start();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
				node.window.populateRecipientSelector(that.recipient,msg.data);
			}); 
	};
	
})(node.window.widgets); 
 
 
 
(function (exports) {
	

	/*
	 * Wait Screen
	 * 
	 * Show a standard waiting screen
	 * 
	 */
	
	exports.WaitScreen = WaitScreen;
	
	function WaitScreen(id) {
		
		this.game = node.game;
		this.id = id || 'waiting';
		this.name = 'WaitingScreen';
		this.version = '0.2.1';
		
		
		this.text = 'Waiting for other players...';
		this.waitingDiv = null;
		
	}
	
	WaitScreen.prototype.append = function (root, id) {};
	
	WaitScreen.prototype.listeners = function () {
		var that = this;
		node.on('WAIT', function(text) {
			that.waitingDiv = node.window.addDiv(document.body, that.id);
			if (that.waitingDiv.style.display === "none"){
				that.waitingDiv.style.display = "";
			}
		
			that.waitingDiv.appendChild(document.createTextNode(that.text || text));
			that.game.pause();
		});
		
		// It is supposed to fade away when a new state starts
		node.on('STATECHANGE', function(text) {
			if (that.waitingDiv) {
				
				if (that.waitingDiv.style.display == ""){
					that.waitingDiv.style.display = "none";
				}
			// TODO: Document.js add method to remove element
			}
		});
		
	}; 
})(node.window.widgets); 
 
 
 
(function (exports) {
	

	/*
	 * Wall
	 * 
	 * Prints lines sequentially;
	 * 
	 */
	
	exports.Wall = Wall;
	
	var Utils = node.Utils;
	
	function Wall(id) {
		this.game = node.game;
		this.id = id || 'wall';
		this.name = 'Wall';
		this.version = '0.2.1';
		
		this.wall = null;
		
		this.buffer = [];
		
		this.counter = 0;
		// TODO: buffer is not read now
		
	}
	
	Wall.prototype.append = function (root, id) {
		var fieldset = node.window.addFieldset(root, this.id+'_fieldset', 'Game Log');
		var idLogDiv = id || this.id;
		this.wall = node.window.addElement('pre', fieldset, idLogDiv);
	};
	
	Wall.prototype.write = function(text) {
		if (document.readyState !== 'complete') {
	        this.buffer.push(s);
	    } else {
	    	var mark = this.counter++ + ') ' + Utils.getTime() + ' ';
	    	this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
	        this.buffer = []; // Where to place it?
	    }  
	};
	
	Wall.prototype.listeners = function() {
		var that = this;
	//		this.game.on('in.say.MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
	//	
	//		this.game.on('out.say.MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
	//	
	//	
	//		this.game.on('MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
		
		node.on('LOG', function(msg){
			that.write(msg);
		});
	}; 
})(node.window.widgets); 
 
 
 
 
 
 
 
