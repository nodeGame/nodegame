(function(exports, node){
	
	var JSUS = node.JSUS;

	var TriggerManager = node.TriggerManager;
	/*!
	 * 
	 * HTMLRenderer: renders objects to HTML according to a series
	 * of criteria.
	 * 
	 */
	
	exports.HTMLRenderer = HTMLRenderer;
	exports.HTMLRenderer.Entity = Entity;
	
	function HTMLRenderer (options) {
		this.options = options = options || {};
		this.tm = new TriggerManager();
		this.init(this.options);
	};
	
	HTMLRenderer.prototype.init = function(options) {
		if (options) {
			if (options.render) {
				options.triggers = options.render;
			}
			this.options = options;
		}
		this.resetRender();
	};
	
	/**
	   * Delete existing render functions and add two 
	   * standards. By default objects are displayed in
	   * a HTMLRenderer of key: values.
	   */
	  HTMLRenderer.prototype.resetRender = function () {
		  this.tm.clear(true);
		  
		  this.tm.addTrigger(function(el){
			  return document.createTextNode(el.content);
		  });
		  
		  this.tm.addTrigger(function (el) { 
			  if ('object' === typeof el.content) {
	    		var div = document.createElement('div');
	    		for (var key in el.content) {
	    			if (el.content.hasOwnProperty(key)) {
	    				var str = key + ':\t' + el.content[key];
	    				div.appendChild(document.createTextNode(str));
	    				div.appendChild(document.createElement('br'));
	    			}
	    		}
	    		return div;
			  }
		  });
		  
		  this.tm.addTrigger(function (el) { 
			  if (el.content.parse && el.content.parse instanceof Function) {
				  var html = el.content.parse();
				  if (JSUS.isElement(html) || JSUS.isNode(html)) {
					  return html;
				  }
			  }
		  });	
		  
		  this.tm.addTrigger(function (el) { 
			  if (JSUS.isElement(el.content) || JSUS.isNode(el.content)) {
	    		return el.content;
			  }
		  });
	  };
	  
	  HTMLRenderer.prototype.clear = function (clear) {
		  return this.tm.clear(clear);
	  };

	  HTMLRenderer.prototype.addRenderer = function (renderer, pos) {
		  return this.tm.addTrigger(renderer, pos);
	  };
	  
	  HTMLRenderer.prototype.removeRenderer = function (renderer) {
		return this.tm.removeTrigger(renderer);
	  };
	
	  HTMLRenderer.prototype.render = function (o) {
		return this.tm.pullTriggers(o);
	  };
	  
	  HTMLRenderer.prototype.size = function () {
		  return this.tm.size();
	  };
	
	  // Abstract HTML Entity reprentation
	  function Entity (e) {		 
		  var e = e || {};
		  this.content = ('undefined' !== typeof e.content) ? e.content : '';
		  this.className = ('undefined' !== typeof e.style) ? e.style : null;
	  };
	
})(
	('undefined' !== typeof node) ? (('undefined' !== typeof node.window) ? node.window : node) : module.parent.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);