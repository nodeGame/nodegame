(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	var Table = node.window.Table
	var HTMLRenderer = node.window.HTMLRenderer;
	
	/*!
	 * DynamicTable
	 * 
	 * Show the memory state of the game
	 */
	
	DynamicTable.prototype = new Table();
	DynamicTable.prototype.constructor = Table;	
	
	exports.DynamicTable = DynamicTable;
	
	DynamicTable.id = 'dynamictable';
	DynamicTable.name = 'Dynamic Table';
	DynamicTable.version = '0.3.1';
	
	DynamicTable.dependencies = {
		Table: {},
		JSUS: {},
		HTMLRenderer: {}
	};
	
	function DynamicTable (options, data) {
		//JSUS.extend(node.window.Table,this);
	    Table.call(this, options, data); 
		this.options = options;
		this.id = options.id;
		
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
		this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
		this.set('state', GameState.compare);
		this.setLeft([]);
		this.parse(true);
	};
		
	DynamicTable.prototype.bind = function (event, bindings) {
		if (!event || !bindings) return;
		var that = this;

		node.on(event, function(msg) {
			
			if (bindings.x || bindings.y) {
				// Cell
				if (that.replace) {
					var func = function (x, y) {
						var found = that.get(x,y);
						if (found.length !== 0) {
							for (var ci=0; ci < found.length; ci++) {
								bindings.cell.call(that, msg, found[ci]);
							}
						}
						else {
							 var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
							 that.add(cell);
						}
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
				
				if (x && y) {
					
					var x = (x instanceof Array) ? x : [x];
					var y = (y instanceof Array) ? y : [y];
					
//					console.log('Bindings found:');
//					console.log(x);
//					console.log(y);
					
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