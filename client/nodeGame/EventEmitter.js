(function (exports, node, NDDB, JSUS) {	

	// node is empty now
	
	
   /**
    * Expose constructor.
    */
	exports.EventEmitter = EventEmitter;
	
	
	//var parser = exports.parser = {};
		 
	function EventEmitter() {
	    this._listeners = new NDDB({auto_sort: true});
	    this._listeners.globalCompare = function (l1, l2) {
	    	if (l1.priority > l2.priority) return 1;
	    	if (l1.priority < l2.priority) return -1;
	    	return 0;
	    };
	};
	
	EventEmitter.prototype = {
	
	    constructor: EventEmitter,
		
	    
	    
	    addListener: function (type, listener) {
		
			// if type is an object we assume a Listener obj was passed
	        var l = ('object' === typeof type) ? type : {listener: listener,
	        					  	 					 event: type
	        };
	        
			this._listeners.insert(new Listener(l));
	    },
	    
	    addLocalListener: function (type, listener) {
	    	this.addListener(type, listener);
	    },
	
	    // TODO: accept any number of parameters
	    emit: function (event, p1, p2, p3) { // Up to three params
	    	if (arguments.length === 0) return;

	    	// TODO: this is too slow...
	    	
//	    	if (arguments.length !== 1) {
//	    		// TODO: this operation could be slow. Can we avoid it?
//	    		arguments = JSUS.obj2Array(arguments,1);
//	    		var event = arguments.shift();
//	    	}
//	    	else {
//	    		var event = arguments[0];
//	    		var arguments = [];
//	    	}
	    	
	    	// Debug
	        //console.log('Fired ' + event);
	    	
	        this._listeners.forEach(function(l) {
	        	if (l.event === event) {
	        		// Executes the listeners only if it is still valid
		    		// Sometimes, when messages are buffered for example, 
		    		// events created in one state are fired during another
		    		// and in some situations that is a problem
	        		if (l.state && l.state !== node.game.gameState) {
	    				if (l.ttl !== -1) {
	    					if (node.game.gameLoop.diff(l.state) > l.ttl) {
	    						return;
	    					}
	    				}
	    			}
		    		var target = l.target || node.game;
		    		l.listener.call(target, p1, p2, p3);
	        	}
	        });
	        
	        //Global Listeners
//	        if (this._listeners[event.type] instanceof Array) {
//	            var listeners = this._listeners[event.type];
//	            for (var i=0, len=listeners.length; i < len; i++) {
//	            	//console.log('Event: ' +  event.type + ' '+ listeners[i].toString());
//	            	listeners[i].call(this.game, p1, p2, p3);
//	            }
//	        }
//	        
//	        // Local Listeners
//	        if (this._localListeners[event.type] instanceof Array) {
//	            var listeners = this._localListeners[event.type];
//	            for (var i=0, len=listeners.length; i < len; i++) {
//	            	//console.log('Event: ' +  event.type + ' '+ listeners[i].toString());
//	            	listeners[i].call(this.game, p1, p2, p3);
//	            }
//	        }
	       
	    },
	
	    removeListener: function(event, listener) {
			if ('undefined' === typeof type) return;
		
			var listeners = this._listeners.select('event', '=', event);
			if (listeners.size() === 0) return false;
			// remove all the listeners associated with 
			// the event if not listener is specified
			if (!listener) listeners.clear(true); 
				
			listeners = listeners.select('listener', '=', listener);
			if (listeners.size() === 0) return false;
			listeners.clear(true);	
		},
	    
	    clearLocalListeners: function() {
	    	this._listeners.select('state', '=', node.state()).clear(true);
	    },
	    
	    // Debug
	    printAllListeners: function() {
	    	node.log('PRINTING ALL LISTENERS');
	    	this._listeners.forEach(function(l){
	    		console.log(i);
	    	});
	    }
	};
	
	function Listener (o) {
		var o = o || {};
		
		// event name
		this.event = o.event; 					
		
		// callback function
		this.listener = o.listener; 			
		
		// events with higher priority are executed first
		this.priority = o.priority || 0; 	
		
		// the state in which the listener is
		// allowed to be executed
		this.state = o.state || node.game.gameState || undefined; 	
		
		// for how many extra steps is the event 
		// still valid. -1 = always valid
		this.ttl = ('undefined' !== typeof o.ttl) ? o.ttl : -1; 
		
		// function will be called with
		// target as 'this'		
		this.target = o.target || undefined;	
	};

})(
	'object' === typeof module ? module.exports : (window.node = {})
  , 'object' === typeof module ? module.parent.exports : node			
  , 'undefined' !== typeof NDDB ? NDDB : module.parent.exports.NDDB
  , 'undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS
);
