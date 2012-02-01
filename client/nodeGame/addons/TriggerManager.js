(function(exports, node){
	
	/*!
	 * 
	 * TriggerManager: holds a collection of function called sequentially. 
	 * this.return flag determines how the hooks are called:
	 * 
	 * - 'first': returns the value from the first trigger which matches the object
	 * - 'last': returns the value from the last trigger, after all have been executed
	 * 
	 */
	
	exports.TriggerManager = TriggerManager;
	
	TriggerManager.first = 'first';
	TriggerManager.last = 'last';
	
	function TriggerManager (options) {
		this.options = options = options || {};
		this.triggers = [];
		this.return = TriggerManager.first; // options are first, last 
		this.init(this.options);
	};
	
	TriggerManager.prototype.init = function(options) {
		this.options = options || this.options;
		if (this.options.return === TriggerManager.first || this.options.return === TriggerManager.last) {
			this.return = this.options.return || this.return;
		}
		this.resetTriggers();
	};
	
	TriggerManager.prototype.initTriggers = function(triggers) {
		if (triggers) {
			if (!(triggers instanceof Array)) {
				triggers = [triggers];
			}
			for (var i=0; i< triggers.length; i++) {
				this.triggers.push(triggers[i]);
			}
		} 
	  };
	
	/**
	   * Delete existing render functions and add the default
	   * ones, if any.
	   */
	  TriggerManager.prototype.resetTriggers = function () {
		  this.triggers = [];
		  this.initTriggers(this.options.triggers);
	  };
	  
	  TriggerManager.prototype.clear = function (clear) {
		  if (!clear) {
			  node.log('Do you really want to clear the current TriggerManager obj? Please use clear(true)', 'WARN');
			  return false;
		  }
		  this.triggers = [];
		  return clear;
	  };
	

	  
	  TriggerManager.prototype.addTrigger = function (trigger, pos) {
		  if (!trigger) return;
		  if (!pos) {
			  this.triggers.push(trigger);
		  }
		  else {
			  this.triggers.splice(pos, 0, trigger);
		  }
		  return true;
	  };
	  
	  
	  TriggerManager.prototype.removeTrigger = function (trigger) {
		for (var i=0; i< this.triggers.length; i++) {
			if (this.triggers[i] == trigger) {
				return this.triggers.splice(i,1);
			}
		}  
		return false;
	  };

	
	  TriggerManager.prototype.pullTriggers = function (o) {
		if (!o) return;
		// New criteria are fired first
		  for (var i = this.triggers.length; i > 0; i--) {
			  var out = this.triggers[(i-1)].call(this, o);
			  if (out) {
				  if (this.return === TriggerManager.first) {
					  return out;
				  }
			  }
		  }
		  // Safety return
		  return o;
	  };
	  
	  TriggerManager.prototype.size = function () {
		  return this.triggers.length;
	  };
	

	
})(
	('undefined' !== typeof node) ? node : module.parent.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);