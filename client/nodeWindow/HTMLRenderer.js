(function(exports, node){
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;

	var Table = node.window.Table;
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
		this.renderers = [];
		this.init(this.options);
	};
	
	HTMLRenderer.prototype.init = function(options) {
		this.options = options || this.options;
		this.initRender();
	};
	
	HTMLRenderer.prototype.initRender = function() {
	  	this.resetRender();
		if (this.options.renderers) {
			if (!(this.options.renderers instanceof Array)) {
				this.options.renderers = [this.options.renderers];
			}
			for (var i=0; i< this.options.renderers.length; i++) {
				this.renderers.push(this.options.renderers[i]);
			}
		} 
	  };
	
	/**
	   * Delete existing render functions and add two 
	   * standards. By default objects are displayed in
	   * a HTMLRenderer of key: values.
	   */
	  HTMLRenderer.prototype.resetRender = function () {
		  this.renderers = [];
		  this.renderers.push(function(el){
			  return document.createTextNode(el.content);
		  });
		  if (Table) {
			  this.renderers.push (function (el) { 
				  if ('object' === typeof el.content) {
		    		var tbl = new HTMLRenderer();
		    		for (var key in el.content) {
		    			if (el.content.hasOwnProperty(key)){
		    				tbl.addRow([key,el.content[key]]);
		    			}
		    		}
		    		return tbl.parse();
				  }
			  });
		  }
		  this.renderers.push (function (el) { 
			  if (JSUS.isElement(el.content) || JSUS.isNode(el.content)) {
	    		return el.content;
			  }
		  });
		  
	  };
	  
	  HTMLRenderer.prototype.clear = function (clear) {
		  if (!clear) {
			  NDDB.log('Do you really want to clear the current HTMLRenderer obj? Please use clear(true)', 'WARN');
			  return false;
		  }
		  this.renderers = [];
		  return clear;
	  };
	

	  
	  HTMLRenderer.prototype.addRenderer = function (renderer) {
		  if (!renderer) return;
		  this.renderers.push(renderer);
	  };
	  
	  
	  
	  HTMLRenderer.prototype.removeRenderer = function (renderer) {
		for (var i=0; i< this.renderers.length; i++) {
			if (this.renderers[i] == renderer) {
				return this.renderers.splice(i,1);
			}
		}  
		return false;
	  };

	
	  HTMLRenderer.prototype.render = function (o) {
		if (!o) return;
		// New criteria are fired first
		  for (var i = this.renderers.length; i > 0; i--) {
			  var out = this.renderers[(i-1)].call(this, o);
			  if (out) return out;
		  }
		  // Safety return
		  return cell.content;
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