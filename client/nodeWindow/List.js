(function(exports, node){
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;

	var HTMLRenderer = node.window.HTMLRenderer;
	var Entity = node.window.HTMLRenderer.Entity;
	
	/*!
	 * 
	 * List: handle list operation
	 * 
	 */
	
	exports.List = List;
	
	List.prototype = new NDDB();
	List.prototype.constructor = List;	
	
	function List (options, data) {
		var options = options || {};
		this.options = options;
		
		NDDB.call(this, options, data); 
		
		this.id = options.id || 'list_' + Math.round(Math.random() * 1000);
		
		this.DL = null;
		this.auto_update = this.options.auto_update || false;
		this.htmlRenderer = null; 
	    
	    this.init(this.options);
	  };
	  
	  // TODO: improve init
	 List.prototype.init = function (options) {
		var options = options || this.options;
		
		this.FIRST_LEVEL = options.first_level || 'dl';
		this.SECOND_LEVEL = options.second_level || 'dt';
		this.THIRD_LEVEL = options.third_level || 'dd';
		
		this.last_dt = 0;
		this.last_dd = 0;
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update
																		: this.auto_update;
	    
		this.DL = options.list || document.createElement(this.FIRST_LEVEL);
		this.DL.id = options.id || this.id;
		if (options.className) {
	    	this.DL.className = options.className;
	    }
		if (options.title) {
			this.DL.appendChild(document.createTextNode(options.title));
		}
		
		this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
	  };
	
	List.prototype.globalCompare = function (o1, o2) {
		if (!o1 && !o2) return 0;
		if (!o2) return 1;
		if (!o1) return -1;
		if (o1.dt < o2.dt) return 1;
		if (o1.dt > o2.dt) return -1;
		if (o1.dt === o2.dt) {
			if (o1.dd < o2.dd) return -1;
			if (o1.dd > o2.dd) return 1;
			if (o1.nddbid < o2.nddbid) return -1;
			if (o1.nddbid > o2.nddbid) return 1;
		}
		return 0;
	}; 
	
	List.prototype._add = function(node) {
		if (!node) return;
		this.insert(node);
		if (this.auto_update) {
			this.parse();
		}
	};
	
	List.prototype.addDT = function (elem, dt) {
		if ('undefined' === typeof elem) return;
		var dt = ('undefined' !== typeof dt) ? dt: this.last_dt++;  
		var node = new Node({dt: dt, content: elem});
		return this._add(node);
	};
	
	List.prototype.addDD = function (elem, dt, dd) {
		if ('undefined' === typeof elem) return;
		var dt = ('undefined' !== typeof dt) ? dt: this.last_dt;
		var dt = ('undefined' !== typeof dd) ? dd: this.last_dd++;
		var node = new Node({dt: dt, dd: dd, content: elem});
		return this._add(node);
	};
	
	List.prototype.parse = function() {
		this.sort();
		var old_dt = null;
		var old_dd = null;
		
		var appendDT = function() {
			var node = document.createElement(this.SECOND_LEVEL);
			this.DL.appendChild(node);
			old_dd = null;
			old_dt = node;
			return node;
		};
		
		var appendDD = function() {
			var node = document.createElement(this.THIRD_LEVEL);
			if (old_dd) {
				old_dd.appendChild(node);
			}
			else if (!old_dt) {
				console.log('creating dt for dd');
				old_dt = appendDT();
			}
			old_dt.appendChild(node);
			return node;
		};
		
		// Reparse all every time
		// TODO: improve this
		if (this.DL) {
			  while (this.DL.hasChildNodes()) {
			        this.DL.removeChild(this.DL.firstChild);
			    }
		  }
		
		
		for (var i=0; i<this.db.length; i++) {
			var el = this.db[i];
			if (!el.dd) {
				var node = appendDT.call(this);
				console.log('just created dt');
			}
			else {
				var node = appendDD.call(this);
			}
			console.log('This is the el')
			console.log(el);
			var content = this.htmlRenderer.render(el);
			console.log('This is how it is rendered');
			console.log(content);
			node.appendChild(content);		
		}
		
		return this.DL;
	};
	
	List.prototype.getRoot = function() {
		return this.DL;
	};
	
	
	
	List.prototype.createItem = function(id) {
		var item = document.createElement(this.SECOND_LEVEL);
		if (id) {
			item.id = id;
		}
		return item;
	};
	
	  // Cell Class
	  Node.prototype = new Entity();
	  Node.prototype.constructor = Node;
	  
	  function Node (node) {
		  Entity.call(this, node);
		  this.dt = ('undefined' !== typeof node.dt) ? node.dt : null;
		  this.dd = ('undefined' !== typeof node.dd) ? node.dd : null;
	  };
	
})(
	('undefined' !== typeof node) ? (('undefined' !== typeof node.window) ? node.window : node) : module.parent.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);