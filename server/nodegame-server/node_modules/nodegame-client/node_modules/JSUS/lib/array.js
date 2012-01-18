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
//		console.log('TO MATCH');
//		console.log(array.length);
		
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
	ARRAY.shuffle = function (array) {
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