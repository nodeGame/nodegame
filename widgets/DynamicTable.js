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
		this.version = '0.3';
		
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
	
	
//	DynamicTable.prototype.addBind = function (event, dim, func) {
//		if (!event || !dim || !func) return; 
//		if (!JSUS.in_array(dim,['x','y','content','header','left'])) return;
//		if (!this.bindings[event]) this.bindings[event] = {};
//		if (!this.bindings[dim]) this.bindings[dim] = [];
//		this.bindings[dim].push(func);
//		
//		
//	};
//	
//	DynamicTable.prototype._bind = function (dim, msg) {
//		if (!dim) return false;
//		if ('undefined' === typeof msg) return false;
//		if (!this.bindings[dim]) return false;
//		if (this.bindings[dim].length === 0) return false; 
//		var out = [];
//		for (var i=0; i < this.bindings[dim].length; i++) {
//			out.push(this.bindings[dim][i].call(this, msg));
//		}
//		return out;
//	};
//	
//	DynamicTable.prototype.bindLeft = function (msg) {
//		return this._bind('left', msg);
//	};
//	
//	DynamicTable.prototype.bindHeader = function (msg) {
//		return this._bind('header', msg);
//	};
//	
//	DynamicTable.prototype.bindX = function (msg) {
//		return this._bind('x', msg);
//	};
//	
//	DynamicTable.prototype.bindY = function (msg) {
//		return this._bind('y', msg);
//	};
//	
//	DynamicTable.prototype.bindContent = function (msg) {
//		return this._bind('content', msg);
//	};
	
	DynamicTable.prototype.bind = function (event, bindings) {
		if (!event || !bindings) return;
		var that = this;
		
		
		
		node.on(event, function(msg) {
			
			console.log(bindings.x);
			
			if (bindings.x || bindings.y) {
				console.log('IN');
				// Cell
				if (that.replace) {
					var func = function (x, y) {
						var found = that.get(x,y);
						if (found.length !== 0) {
							console.log('this is cell');
							console.log(cell);
							for (var ci=0; ci < found.length; ci++) {
								console.log('qui dentro');
								bindings.cell.call(that, msg, found[ci]);
							}
						}
						else {
							 var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
							 that.add(cell);
						}
//						var found = that.get(x,y);
//						console.log('Found');
//						console.log(found);
//						if (found.length !== 0) {
//							for (var i=0; i< found.length; i++) {
//								found[i].content = content;
//								console.log('content');
//								console.log(content);
//							}
//						}
					}
				}
				else {
					var func = function (x, y) {
						var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
						that.add(cell, x, y);
					}
				}
	
				
				var x = bindings.x.call(that, msg);
				var y = bindings.y.call(that, msg);
				//var c = bindings.content.call(that, msg);
				if (x && y) {
					
					var x = (x instanceof Array) ? x : [x];
					var y = (y instanceof Array) ? y : [y];
					//var c = (c instanceof Array) ? c : [c];
					
					console.log('Bindings found:');
					console.log(x);
					console.log(y);
					//console.log(c);
					
					
					for (var xi=0; xi < x.length; xi++) {
						for (var yi=0; yi < y.length; yi++) {
							// Replace or Add
							func.call(that, x[xi], y[yi]);
						}
					}
				}
				// End Cell
			}
			
			// Header
			if (bindings.header) {
				var h = bindings.header.call(that, msg);
				var h = (h instanceof Array) ? h : [h];
				that.setHeader(h);
				
//				for (var hi=0; hi < h.length; hi++) {
//					if (!JSUS.in_array(h[hi], that.header)) {
//						that.header.push(h[hi]);
//						console.log(h[hi]);
//					}
//				}
			}
			
			// Left
			if (bindings.left) {
				var l = bindings.left.call(that, msg);
				if (!JSUS.in_array(l, that.left)) {
					that.header.push(l);
				}
			}
			
			// Auto Update?
			if (that.auto_update) {
				that.parse();
			}
		});
		
	};

	DynamicTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.table);
		return root;
	};
	
	DynamicTable.prototype.listeners = function () {}; 

})(node.window.widgets);