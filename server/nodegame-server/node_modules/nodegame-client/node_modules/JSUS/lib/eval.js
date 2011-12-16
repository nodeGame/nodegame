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