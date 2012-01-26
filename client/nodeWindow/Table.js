(function(exports, node){
	
	/*!
	 * 
	 * Table: abstract representation of an HTML table
	 * 
	 */
	exports.Table = Table;
	exports.Table.Cell = Cell;
	
	// For simple testing
	// module.exports = Table;
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
	var HTMLRenderer = node.window.HTMLRenderer;
	var Entity = node.window.HTMLRenderer.Entity;
	
	Table.prototype = new NDDB();
	Table.prototype.constructor = Table;	
	
	Table.H = ['x','y','z'];
	Table.V = ['y','x', 'z'];
	
	Table.log = node.log;
	
  function Table (options, data) {
	var options = options || {};

	NDDB.call(this, options, data);  
    
    Table.log = options.log || Table.log;
    this.defaultDim1 = options.defaultDim1 || 'x';
    this.defaultDim2 = options.defaultDim2 || 'y';
    this.defaultDim3 = options.defaultDim3 || 'z';
    
    this.table = options.table || document.createElement('table'); 
    this.id = options.id || 'table_' + Math.round(Math.random() * 1000);
    
    this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : false;
    
    // Class for missing cells
    this.missing = options.missing || 'missing';
    this.pointers = {
    				x: options.pointerX || 0,
    				y: options.pointerY || 0,
    				z: options.pointerZ || 0
    };
    
    this.header = [];
    this.footer = [];
    
    this.left = [];
    this.right = [];
    
    this.htmlRenderer = null; 
    
    this.init(this.options);
  };
  
  // TODO: improve init
  Table.prototype.init = function (options) {
	var options = options || this.options;
    this.table.id = options.id || this.id;
    if (options.className) {
    	this.table.className = options.className;
    }
    this.initRenderer(options.render);
  };
  
  Table.prototype.initRenderer = function(options) {
	this.htmlRenderer = new HTMLRenderer();	
	this.htmlRenderer.addRenderer(function(el) {
		if ('object' === typeof el.content) {
    		var tbl = new Table();
    		for (var key in el.content) {
    			if (el.content.hasOwnProperty(key)){
    				tbl.addRow([key,el.content[key]]);
    			}
    		}
    		return tbl.parse();
		}
	});
	if (options) {
		if (!(options instanceof Array)) {
			options = [options];
		}
		for (var i=0; i< options.length; i++) {
			this.htmlRenderer.addRenderer(options[i]);
		}
	} 
  };
  
  // TODO: make it 3D
  Table.prototype.get = function (x, y) {
	  var out = this;
	  if ('undefined' !== typeof x) {
		  out = this.select('x','=',x);
	  }
	  if ('undefined' !== typeof y) {
		  out = out.select('y','=',y);
	  }
	 
	  return out.fetch();	  
  };
  
  Table.prototype.addClass = function (c) {
	if (!c) return;
	if (c instanceof Array) c = c.join(', ');
	
	this.forEach(function (el) {
		if (!el.className) {
			el.className = c;
		} 
		else {
			el.className += ', ' + c;
		}
	});
	
	return this;
  };

  // Depends on node.window
  Table.prototype.removeClass = function (c) {
	if (!c) return;
	
	if (c instanceof Array) {
		var func = function(el, c) {
			for (var i=0; i< c.length; i++) {
				node.window.removeClass(el, c[i]);
			}
		}
	}
	else {
		var func = node.window.removeClass;
	}
	
	this.forEach(function (el) {
		func.call(this,el,c);
	});
	
	return this;
  };
  
  Table.prototype._addSpecial = function (data, type) {
	if (!data) return;
	var type = type || 'header';
	if ('object' !== typeof data) {
		return {content: data, type: type};
	}
	
	var out = [];
	for (var i=0; i < data.length; i++) {
		out.push({content: data[i], type: type});
	} 
	return out;
  };
  
  Table.prototype.setHeader = function (header) {
	  this.header = this._addSpecial(header);
  };

  Table.prototype.add2Header = function (header) {
	  this.header = this.header.concat(this._addSpecial(header));
  };
  
  Table.prototype.setLeft = function (left) {
	  this.left = this._addSpecial(left, 'left');
  };
  
  Table.prototype.add2Left = function (left) {
	  this.left = this.left.concat(this._addSpecial(left, 'left'));
  };

// TODO: setRight  
//  Table.prototype.setRight = function (left) {
//	  this.right = this._addSpecial(left, 'right');
//  };
  
  Table.prototype.setFooter = function (footer) {
	  this.footer = this._addSpecial(footer, 'footer');
  };
  
  Table._checkDim123 = function (dims) {
	  var t = Table.H.slice(0);
	  for (var i=0; i< dims.length; i++) {
		  if (!JSUS.removeElement(dims[i],t)) return false;
	  }
	  return true;
  };
  
  /**
   * Updates the reference to the foremost element in the table. 
   * 
   * @param 
   */
  Table.prototype.updatePointer = function (pointer, value) {
	 if (!pointer) return false;
	 if (!JSUS.in_array(pointer, Table.H)) {
		 Table.log('Cannot update invalid pointer: ' + pointer, 'ERR');
		 return false;
	 }
	 
	 if (value > this.pointers[pointer]) {
		 this.pointers[pointer] = value;
		 return true;
	 }
	  
  };
  
  Table.prototype._add = function (data, dims, x, y, z) {
	if (!data) return false;
	if (dims) {
		if (!Table._checkDim123(dims)){
			Table.log('Invalid value for dimensions. Accepted only: x,y,z.')
			return false
		}
	}
	else {
		dims = Table.H;
	}
		
	var insertCell = function (content){	
		//Table.log('content');
//		Table.log(x + ' ' + y + ' ' + z);
//		Table.log(i + ' ' + j + ' ' + h);
		
		var cell = {};
		cell[dims[0]] = i; // i always defined
		cell[dims[1]] = (j) ? y+j : y;
		cell[dims[2]] = (h) ? z+h : z;
		cell['content'] = content;	
		//Table.log(cell);
		this.insert(new Cell(cell));
		this.updatePointer(dims[0],cell[dims[0]]);
		this.updatePointer(dims[1],cell[dims[1]]);
		this.updatePointer(dims[2],cell[dims[2]]);
	};
	
	// By default, only the second dimension is incremented
	var x = x || this.pointers[dims[0]]; 
	var y = y || this.pointers[dims[1]] + 1;
	var z = z || this.pointers[dims[2]];
	
	if ('object' !== typeof data) data = [data]; 
	
	var cell = null;
	// Loop Dim1
	for (var i = 0; i < data.length; i++) {
		//Table.log('data_i');
		//Table.log(data[i]);
		if (data[i] instanceof Array) {
			// Loop Dim2
			for (var j = 0; j < data[i].length; j++) {
//				Table.log(data[i]);
				if (data[i][j] instanceof Array) {
//					Table.log(data[i][j]);
//					Table.log(typeof data[i][j]);
					// Loop Dim3
					for (var h = 0; h < data[i][j].length; h++) {
						//Table.log('Here h');
						insertCell.call(this, data[i][j][h]);
					}
					h=0; // reset h
				}
				else {
					//Table.log('Here j');
					insertCell.call(this, data[i][j]);
				}
			}
			j=0; // reset j
		}
		else {
			//Table.log('Here i');
			insertCell.call(this, data[i]);
		}
	}
//	
//	Table.log('After insert');
//	Table.log(this.db);
	
	// TODO: if coming from addRow or Column this should be done only at the end
	if (this.auto_update) {
		this.parse(true);
	}
	
  };
  
  Table.prototype.add = function (data, x, y) {
	  if (!data) return;
	  var cell = (data instanceof Cell) ? data : new Cell({
		  x: x,
		  y: y,
		  content: data
	  })
	  var result = this.insert(cell);
	  
	  if (result) {
		  this.updatePointer('x',x);
		  this.updatePointer('y',y);
	  }
	  return result;
  };
    
  Table.prototype.addColumn = function (data, x, y) {
	if (!data) return false;
	return this._add(data, Table.V, x, y);
  };
  
  Table.prototype.addRow = function (data, x, y) {
	if (!data) return false;
	return this._add(data, Table.H, x, y);
  };
  
//  Table.prototype.bind = function (dim, property) {
//	  this.binds[property] = dim;
//  };
  
  // TODO: Only 2D for now
  // TODO: improve algorithm, rewrite
  Table.prototype.parse = function () {
	  
	  // Create a cell element (td,th...)
	  // and fill it with the return value of a
	  // render value. 
	  var fromCell2TD = function (cell, el) {
		  if (!cell) return;
		  var el = el || 'td';
		  var TD = document.createElement(el);
		  var content = this.htmlRenderer.render(cell);
		  //var content = (!JSUS.isNode(c) || !JSUS.isElement(c)) ? document.createTextNode(c) : c;
		  TD.appendChild(content);
		  if (cell.className) TD.className = cell.className;
		  return TD;
	  };
	  
	  if (this.table) {
		  while (this.table.hasChildNodes()) {
		        this.table.removeChild(this.table.firstChild);
		    }
	  }
	  
	  var TABLE = this.table;
	  
	  // HEADER
	  if (this.header && this.header.length > 0) {
		  var THEAD = document.createElement('thead');
		  var TR = document.createElement('tr');
		  // Add an empty cell to balance the left header column
		  if (this.left && this.left.length > 0) {
			  TR.appendChild(document.createElement('th'));
		  }
		  for (var i=0; i < this.header.length; i++) {
			  TR.appendChild(fromCell2TD.call(this, this.header[i],'th'));
		  }
		  THEAD.appendChild(TR);
		  i=0;
		  TABLE.appendChild(THEAD);
	  }
	  
//	  console.log(this.table);
//	  console.log(this.id);
//	  console.log(this.db.length);
	  
	  // BODY
	  if (this.size() !== 0) {
		  var TBODY = document.createElement('tbody');
		 
		  this.sort(['y','x']); // z to add first
		  var trid = -1;
		  // TODO: What happens if the are missing at the beginning ??
		  var f = this.first();
		  var old_x = f.x;
		  var old_left = 0;
		
		  for (var i=0; i < this.db.length; i++) {
			  //console.log('INSIDE TBODY LOOP');
			  //console.log(this.id);
			  if (trid !== this.db[i].y) {
				  var TR = document.createElement('tr');
				  TBODY.appendChild(TR);
				  trid = this.db[i].y;
				  //Table.log(trid);
				  old_x = f.x - 1; // must start exactly from the first
				  
				// Insert left header, if any
				  if (this.left && this.left.length > 0) {
					  var TD = document.createElement('td');
					  //TD.className = this.missing;
					  TR.appendChild(fromCell2TD.call(this, this.left[old_left]));
					  old_left++;
				  }
			  }
			  
			  // Insert missing cells
			  if (this.db[i].x > old_x + 1) {
				  var diff = this.db[i].x - (old_x + 1);
				  for (var j=0; j < diff; j++ ) {
					  var TD = document.createElement('td');
					  TD.className = this.missing;
					  TR.appendChild(TD);
				  }
			  }
			  // Normal Insert
			  TR.appendChild(fromCell2TD.call(this, this.db[i]));
			  
			  // Update old refs
			  old_x = this.db[i].x;
		  }
		  TABLE.appendChild(TBODY);
	  }
	 
	  
	  //FOOTER
	  if (this.footer && this.footer.length > 0) {
		  var TFOOT = document.createElement('tfoot');
		  var TR = document.createElement('tr');
		  for (var i=0; i < this.header.length; i++) {
			  TR.appendChild(fromCell2TD.call(this, this.footer[i]));
		  }
		  TFOOT.appendChild(TR);
		  TABLE.appendChild(TFOOT);
	  }
	  
	  return TABLE;
  };
  
  // Cell Class
  Cell.prototype = new Entity();
  Cell.prototype.constructor = Cell;
  
  function Cell (cell){
	  Entity.call(this, cell);
	  this.x = ('undefined' !== typeof cell.x) ? cell.x : null;
	  this.y = ('undefined' !== typeof cell.y) ? cell.y : null;
	  this.z = ('undefined' !== typeof cell.z) ? cell.z : null;
  };
  
})(
	('undefined' !== typeof node) ? (('undefined' !== typeof node.window) ? node.window : node) : module.parent.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);
