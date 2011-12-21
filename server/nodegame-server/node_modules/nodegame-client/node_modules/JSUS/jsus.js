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
	}
	// end node

})('undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window);