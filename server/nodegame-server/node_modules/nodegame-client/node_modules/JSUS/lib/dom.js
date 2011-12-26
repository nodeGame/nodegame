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
	DOM.isElement = function(o){
	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
	  );
	}

	JSUS.extend(DOM);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);