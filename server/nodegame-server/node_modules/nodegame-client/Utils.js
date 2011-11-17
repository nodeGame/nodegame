(function (exports) {
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.Utils = Utils;
	
	function Utils(){};
	
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
	
	Utils.objToArray = function (obj) {
	    var result = [];
	    for (var key in obj) {
	       if (obj.hasOwnProperty(key)) {
	           result.push(obj[key]);
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
	 * Match each element of the array with N random others
	 * 
	 */
	Utils.matchN = function (array, N) {
		var result = []
		var len = array.length;
		for (var i = 0 ; i < len ; i++) {
			var copy = array.slice(0);
			copy.splice(i,1);
			var group = Utils.getNRandom(copy,N);
			group.splice(0,0,array[i]);
			
			//Update
			result.push(group);
			group = [];
		}
		return result;
	};
	
	/**
	 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	 * 
	 */
	Utils.shuffle = function (array, N, callback) {
		var copy = array.slice(0);
		var len = array.length-1; // ! -1
		for (var i = len; i > 0; i--) {
			var j = Math.floor(Math.random(0,1)*i);
			var tmp = copy[j];
			copy[j] = copy[i];
			copy[i] = tmp;
			console.log(copy);
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


})('undefined' != typeof node ? node : module.exports);