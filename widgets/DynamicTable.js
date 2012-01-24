(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	
	/*!
	 * DynamicTable
	 * 
	 * Show the memory state of the game
	 */
	
	exports.DynamicTable = DynamicTable;
	
	function DynamicTable (options, data) {
		JSUS.extend(node.window.Table,this);
		JSUS.extend()
	    node.window.Table.call(this, options, data); 
	    
		this.options = options;
		this.id = options.id || 'dynamictable';
		this.name = 'Dynamic Table';
		this.version = '0.2';
		
		this.fieldset = { legend: this.name,
				  		  id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.binds = {};
		this.init(this.options);
	};
	
	DynamicTable.prototype.addBind = function(dim, func){
		if (!JSUS.in_array(dim,['x','y','content','header','left'])) return;
		if (!this.binds[dim]) this.binds[dim] = [];
		this.binds[dim].push(func);
	}
	
	DynamicTable.prototype._bind = function (dim, msg) {
		if (!dim) return false;
		if ('undefined' === typeof msg) return false;
		if (!this.binds[dim]) return false;
		if (this.binds[dim].length === 0) return false; 
		var out = [];
		for (var i=0; i < this.binds[dim].length; i++){
			out.push(this.binds[dim].call(this, msg);)
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
				var content = that.bindContent(msg);
				var x = that.bindX(msg);
				var y = that.bindY(msg);
				
				for (var xi=0; xi < x.length; xi++) {
					for (var yi=0; yi < y.length; yi++) {
						for (var ci=0; ci < content.length; ci++) {
							this.add(content[ci], x[xi], y[yi]);
						}
					}
				}
				
				
				// Header
				var h = that.bindHeader(msg);
				if (!JSUS.in_array(h, that.header)) {
					that.header.push(h);
				}
				// Left
				var l = that.bindLeft(msg);
				if (!JSUS.in_array(l, that.left)) {
					that.header.push(l);
				}
				// Auto Update?
				if (that.auto_update) {
					that.parse();
				}
			});
		}
	};
	
	DynamicTable.prototype.init = function (options) {
		this.options = options;
		this.auto_update: ('undefined' !== typeof options.auto_update) ? options.auto_update : true;
		this.initRender();
		this.set('state', GameState.compare);
		this.setLeft([]);
		this.parse(true);
	};
	
	DynamicTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.table);
		return root;
	};
	
	DynamicTable.prototype.listeners = function () {}; 

})(node.window.widgets);