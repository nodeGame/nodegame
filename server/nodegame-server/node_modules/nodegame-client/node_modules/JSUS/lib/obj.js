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
		var clone = {};
		for (var i in obj) {
			if ( 'object' === typeof obj[i] ) {
				clone[i] = OBJ.clone(obj[i]);
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