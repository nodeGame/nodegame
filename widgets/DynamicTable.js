(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	var Table = node.window.Table
	/*!
	 * DynamicTable
	 * 
	 * Show the memory state of the game
	 */
	
	DynamicTable.prototype = new Table();
	DynamicTable.prototype.constructor = Table;	
	
	exports.DynamicTable = DynamicTable;
	
	function DynamicTable (options, data) {
		//JSUS.extend(node.window.Table,this);
	    Table.call(this, options, data); 
	    
		this.options = options;
		this.id = options.id || 'dynamictable';
		this.name = 'Dynamic Table';
		this.version = '0.2';
		
		this.fieldset = { legend: this.name,
				  		  id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.bindings = {};
		this.init(this.options);
	};
	
	DynamicTable.prototype.init = function (options) {
		this.options = options;
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : true;
		this.replace = options.replace || false;
		this.initRender();
		this.set('state', GameState.compare);
		this.setLeft([]);
		this.parse(true);
	};
	
	
	DynamicTable.prototype.addBind = function (event, dim, func) {
		if (!this.bindings[event]) this.bindings[event] = {}; 
		if (!JSUS.in_array(dim,['x','y','content','header','left'])) return;
		if (!this.bindings[dim]) this.bindings[dim] = [];
		this.bindings[dim].push(func);
	};
	
	DynamicTable.prototype._bind = function (dim, msg) {
		if (!dim) return false;
		if ('undefined' === typeof msg) return false;
		if (!this.bindings[dim]) return false;
		if (this.bindings[dim].length === 0) return false; 
		var out = [];
		for (var i=0; i < this.bindings[dim].length; i++) {
			out.push(this.bindings[dim][i].call(this, msg));
		}
		return out;
	};
	
	DynamicTable.prototype.bindLeft = function (msg) {
		return this._bind('left', msg);
	};
	
	DynamicTable.prototype.bindHeader = function (msg) {
		return this._bind('header', msg);
	};
	
	DynamicTable.prototype.bindX = function (msg) {
		return this._bind('x', msg);
	};
	
	DynamicTable.prototype.bindY = function (msg) {
		return this._bind('y', msg);
	};
	
	DynamicTable.prototype.bindContent = function (msg) {
		return this._bind('content', msg);
	};
	
	DynamicTable.prototype.listenTo = function () {
		if (!arguments) return;
		var that = this;
		for (var i=0; i<arguments.length;i++) {
			node.on(arguments[i], function(msg) {
				
				// Cell
				if (that.replace) {
					var func = function (content, x, y) {
						var found = that.get(x,y);
						if (found.length === 0) return;
						for (var i=0; i< found.length; i++) {
							found[i].content = content;
						}
					}
				}
				else {
					var func = that.add;
				}
				
				
				var x = that.bindX(msg);
				var y = that.bindY(msg);
				var content = that.bindContent(msg);
				if (x && y) {
					for (var xi=0; xi < x.length; xi++) {
						for (var yi=0; yi < y.length; yi++) {
							for (var ci=0; ci < content.length; ci++) {
								func.call(this, content[ci], x[xi], y[yi]);
							}
						}
					}
				}
				// End Cell
				
				// Header
				var h = that.bindHeader(msg);
				if (h && !JSUS.in_array(h, that.header)) {
					that.header.push(h);
				}
				// Left
				var l = that.bindLeft(msg);
				if (l && !JSUS.in_array(l, that.left)) {
					that.header.push(l);
				}
				// Auto Update?
				if (that.auto_update) {
					that.parse();
				}
			});
		}
	};

	DynamicTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.table);
		return root;
	};
	
	DynamicTable.prototype.listeners = function () {}; 

})(node.window.widgets);