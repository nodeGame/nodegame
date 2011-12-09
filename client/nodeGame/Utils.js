(function (exports) {
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.Utils = Utils;
	
	function Utils(){};
	
	// Add the filter method to Array objects in case the method is not
	// supported natively. 
	// See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter#Compatibility
	
    if (!Array.prototype.filter)  
    {  
      Array.prototype.filter = function(fun /*, thisp */)  
      {  
        "use strict";  
      
        if (this === void 0 || this === null)  
          throw new TypeError();  
      
        var t = Object(this);  
        var len = t.length >>> 0;  
        if (typeof fun !== "function")  
          throw new TypeError();  
      
        var res = [];  
        var thisp = arguments[1];  
        for (var i = 0; i < len; i++)  
        {  
          if (i in t)  
          {  
            var val = t[i]; // in case fun mutates this  
            if (fun.call(thisp, val, i, t))  
              res.push(val);  
          }  
        }  
      
        return res;  
      };  
    }  
	
    Utils.in_array = function (needle, haystack){
	  var o = {};
	  for(var i=0;i<a.length;i++){
	    o[a[i]]='';
	  }
	  
	  return needle in haystack;
    }
    
    
    Utils.eval = function (str, context) {
    	
    	// Eval must be called indirectly
    	// i.e. eval.call is not possible
    	var func = function (str) {
    		// TODO: Filter str
    		return eval(str);
    	}
    	return func.call(context, str);
    };
    
	Utils.getDate = function() {
		var d = new Date();
		var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
				+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
				+ d.getMilliseconds();
		
		return date;
	};
	
	Utils.getTime = function() {
		var d = new Date();
		var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
		
		return time;
	};
	
	Utils.getListSize = function (list) {	
		var n = 0;
		for (var key in list) {
		    if (list.hasOwnProperty(key)) {
		    	n++;
		    }
		}
		
		//console.log('Calculated list length ' + n);
		
		return n;
	};
	
	//TODO: Improve
	Utils.print_r = function (array) {
		for (var i=0,len=array.length;i<len;i++){
			var el = array[i]; 
			if (typeof(el) === 'Array'){
				Utils.print_r(el);
			}
			else {
				if (typeof(el) === 'Object'){
					for (var key in el) {
						if (el.hasOwnProperty(key)){
							console.log(key + ' ->\n');
							Utils.print_r(el[key]);
						}
					}
				}
				else {
					console.log(el);
				}
			}
		}
	};
	
	Utils.obj2Array = function (obj) {
		//console.log(obj);
	    var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	           result.push(obj[key]);
	           //console.log(obj[key]);
	       }
	    }
	    return result;
	}
	
	/**
	 * Creates an array containing all keys and values of the obj.
	 */
	Utils.obj2KeyedArray = function (obj) {
		//console.log(obj);
	    var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	    	   result.push(key);
	           result.push(obj[key]);
	       }
	    }
	    return result;
	}
	
	/**
	 * Creates an array of key:value objects.
	 * 
	 */
	Utils.implodeObj = function (obj) {
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
	}
	
	/**
	 * Returns an array days, minutes, seconds, mi
	 * @param ms time in milliseconds
	 * @return array 
	 */
	Utils.parseMilliseconds = function (ms) {
	  
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

	/**
	 * Returns an array of N array containing the same number of elements
	 * The last group could have less elements.
	 * 
	 */ 
	Utils.getNGroups = function (array, N) {
		return Utils.getGroupsSizeN(array, Math.floor(array.length / N));
	};
	
	/**
	 * Returns an array of array containing N elements each
	 * The last group could have less elements.
	 * 
	 */ 
	Utils.getGroupsSizeN = function (array, N) {
		
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
	Utils.matchN = function (array, N, strict) {
		var result = []
		var len = array.length;
		var found = [];
		for (var i = 0 ; i < len ; i++) {
			// Recreate the array
			var copy = array.slice(0);
			copy.splice(i,1);
			if (strict) {
				copy = Utils.arrayDiff(copy,found);
			}
			var group = Utils.getNRandom(copy,N);
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
	
	Utils.arraySelfConcat = function(array) {
		var i = 0;
		var len = array.length;
		var result = []
		for (;i<len;i++) {
			result = result.concat(array[i]);
		}
		return result;
	};
	
//	Utils.matchN = function (array, N, strict) {
//		var result = []
//		var len = array.length;
//		var copy = array.slice(0);
//		for (var i = 0 ; i < len ; i++) {
//			
//			// Remove the current element from copy if still present
//			var idx = copy.indexOf(array[i]);
//			if (idx > 0) {
//				copy.splice(idx,1);
//			}
//			console.log(idx);
//			console.log(copy);
//			
//			// Find N random elem
//			var group = Utils.getNRandom(copy,N);
//			
//			// Update copy
//			if (strict) {
//				copy = Utils.arrayDiff(copy,group);
//			}
//			else {
//				copy = array.slice(0);
//			}
//			
//			// Update results
//			if (idx > 0) {
//				group.splice(idx,0,array[i]);
//			}
//			// Push
//			result.push(group);
//			group = [];
//			
//		}
//		return result;
//	};
	
	/**
	 * Performs a diff between two arrays. 
	 * Returns all the values of the first array which are not present 
	 * in the second one.
	 */
	Utils.arrayDiff = function(a1, a2) {
		return a1.filter( function(i) {
			return !(a2.indexOf(i) > -1);
		});
	};
	
	/**
	 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	 * 
	 */
	Utils.shuffle = function (array, N, callback) {
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
	
	Utils.getNRandom = function (array, N, callback) {
		return Utils.shuffle(array).slice(0,N);
	};                           
	                           	
	Utils.generateCombinations = function (array, r, callback) {
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
	}
	
	/**
	 * Creates a perfect copy of the obj
	 */
	Utils.clone = function (obj) {
		var clone = {};
		for (var i in obj) {
			if ( 'object' === typeof obj[i] ) {
				clone[i] = Utils.clone(obj[i]);
			}
			else {
				clone[i] = obj[i];
			}
		}
		return clone;
	};
	
	/**
	 * Performs a left join on the keys of two objects. In case keys overlaps
	 *  the values from obj2 are taken.
	 */
	Utils.join = function (obj1, obj2) {
		var clone = Utils.clone(obj1);
		if (!obj2) return clone;
		for (var i in clone) {
			if (clone.hasOwnProperty(i)) {
				if ('undefined' !== typeof obj2[i]) {
					if ( 'object' === typeof obj2[i] ) {
						clone[i] = Utils.join(clone[i], obj2[i]);
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
	Utils.merge = function (obj1, obj2) {
		var clone = Utils.clone(obj1);
		if (!obj2) return clone;
		for (var i in obj2) {
			if (obj2.hasOwnProperty(i)) {
				if ( 'object' === typeof obj2[i] ) {
					clone[i] = Utils.merge(obj1[i],obj2[i]);
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
	Utils.mergeOnKey = function (obj1, obj2, key) {
		var clone = Utils.clone(obj1);
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
	
	Utils.mergeOnValue = function (obj1, obj2) {
		return Utils.mergeOnKey(obj1, obj2, 'value');
	};

})('undefined' != typeof node ? node : module.exports);