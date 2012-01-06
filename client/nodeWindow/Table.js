(function(exports){
	
	/*!
	 * 
	 * Table: abstract representation of an HTML table
	 * 
	 */
	var node = exports;
	exports.Table = Table;
	
	// For simple testing
	//module.exports = Table;
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
	
	Table.H = ['x','y','z'];
	Table.V = ['y','x', 'z'];
	
	Table.log = console.log;
	
  function Table (options, data) {
	var options = options || {};
	        
	JSUS.extend(node.NDDB,this);
    node.NDDB.call(this, options, data);  
    
    Table.log = options.log || Table.log;
    this.defaultDim1 = options.defaultDim1 || 'x';
    this.defaultDim2 = options.defaultDim2 || 'y';
    this.defaultDim3 = options.defaultDim3 || 'z';
    
    // Class for missing cells
    this.missing = options.missing || 'missing';
    this.pointers = {
    				x: options.pointerX || 0,
    				y: options.pointerY || 0,
    				z: options.pointerZ || 0
    };
    
    this.id = options.id || 'table';  

//	if (options.root) {
//		this.setRoot(options.root);
//	}
//	else {
//		this.root = this.createRoot(this.id, options);
//	}
//	
//	this.pointer = this.root; // Points to the last row added;
//	this.odd = 'odd';
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
	
  Table.prototype.setRoot = function (root) {
	  if (!root) return false;
	  if (this.root && this.root.childNodes) {
		  root.appendChild(children);
	  }
	  this.root = root;
	  this.id = ('undefined' !== typeof root.id) ? root.id : this.id;
  };
  
  Table.prototype.append = function(root) {
    return root.appendChild(this.root);
  };
  
  
  Table.prototype.createRoot = function (id, options) {
    var root = document.createElement('table');
    root.id = id;
    return root;
  };
  
  Table.prototype.addHeaderRow = function (data, attributes) {
    var thead = document.createElement('thead');
    return this.addRow(data, attributes, thead);
  };
  
//  Table.prototype.addRow = function (data, attributes, container) {
//    var row = document.createElement('tr');
//    
//    if (attributes) {
//    	node.window.addAttributes2Elem(row, attributes);
//    }
//    
//    for (var i = 0; i < data.length; i++) {
//            var cell = document.createElement('td');
//            var cellContent = document.createTextNode(data[i]);
//            cell.appendChild(cellContent);
//            row.appendChild(cell);
//        } 
//    
//    // If we have other elements, e.g. thead, add them. 
//    // If it is not a normal no even or odd class is added.
//    if (container) {
//      container.appendChild(row);
//      return this.appendRow(container, false);
//    }
//    else {
//      return this.appendRow(row);
//    }
//    
//  };
//  
  Table.prototype.appendRow = function (row, addClass) {
    var addClass = ('undefined' !== typeof addClass) ? addClass : true;
    this.root.appendChild(row);
    this.pointer = row;
    if (addClass) {
      row.className += this.id + '_' + this.odd;
      this.odd = (this.odd == 'odd') ? 'even' : 'odd'; // toggle pointer to odd or even row
    }
    return row;
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
	
//	console.log('DATA TBL');
//	console.log(data);
	
	// By default, only the second dimension is incremented
	var x = x || this.pointers[dims[0]]; 
	var y = y || this.pointers[dims[1]] + 1;
	var z = z || this.pointers[dims[2]];
	
	if ('object' !== typeof data) data = [data]; 
	
	var insertCell = function (content){	
		//console.log('content');
//		console.log(x + ' ' + y + ' ' + z);
//		console.log(i + ' ' + j + ' ' + h);
		
		var cell = {};
		cell[dims[0]] = i; // i always defined
		cell[dims[1]] = (j) ? y+j : y;
		cell[dims[2]] = (h) ? z+h : z;
		cell['content'] = content;	
		//console.log(cell);
		this.insert(new Cell(cell));
		this.updatePointer(dims[0],cell[dims[0]]);
		this.updatePointer(dims[1],cell[dims[1]]);
		this.updatePointer(dims[2],cell[dims[2]]);
	};
	
	
	var cell = null;
	// Loop Dim1
	for (var i = 0; i < data.length; i++) {
		//console.log('data_i');
		//console.log(data[i]);
		if (data[i] instanceof Array) {
			// Loop Dim2
			for (var j = 0; j < data[i].length; j++) {
//				console.log(data[i]);
				if (data[i][j] instanceof Array) {
//					Table.log(data[i][j]);
//					Table.log(typeof data[i][j]);
					// Loop Dim3
					for (var h = 0; h < data[i][j].length; h++) {
						//console.log('Here h');
						insertCell.call(this, data[i][j][h]);
					}
					h=0; // reset h
				}
				else {
					//console.log('Here j');
					insertCell.call(this, data[i][j]);
				}
			}
			j=0; // reset j
		}
		else {
			//console.log('Here i');
			insertCell.call(this, data[i]);
		}
	}
//	
//	console.log('After insert');
//	console.log(this.db);
	
  };
    
  Table.prototype.addColumn = function (data, attributes, container) {
	if (!data) return false;
	return this._add(data, Table.V);
  };
  
  Table.prototype.addRow = function (data, attributes, container) {
		if (!data) return false;
		return this._add(data, Table.H);
	  };
  
  Table.prototype.getRoot = function() {
    return this.root;
  };
  
  // TODO: Only 2D for now
  Table.prototype.parse = function() {
	  var root = document.createElement('table');
	  if (this.size() ===  0) return root;
	  
	  this.sort(['y','x']); // z to add first
	  var trid = -1;
	  // TODO: What happens if the are missing at the beginning ??
	  var f = this.first();
	  var old_x = f.x;
	  // TODO: Do we need old_y and old_z ?
	  var old_y = f.y;
	  var old_z = f.z;
	  console.log(this);
	  for (var i=0; i < this.db.length; i++) {
		  //if (this.db[i].x !==
		  if (trid !== this.db[i].y) {
			  var TR = document.createElement('tr');
			  root.appendChild(TR);
			  trid = this.db[i].y;
			  //console.log(trid);
			  old_x = f.x - 1; // must start exactly from the first
//			  old_y = f.y - 1;
//			  old_z = f.z - 1;
		  }
		  
		  // Insert missing cells
		  if (this.db[i].x > old_x + 1) {
			  var diff = this.db[i].x - (old_x + 1);
			  for (var j=0; j < diff; j++ ) {
				  var TD = document.createElement('td');
				  TD.setAttribute('class', this.missing);
				  TR.appendChild(TD);
			  }
		  }
		  // Normal Insert
		  var TD = document.createElement('td');
		  var c = this.db[i].content;
		  var content = (!JSUS.isNode(c) || !JSUS.isElement(c)) ? document.createTextNode(c) : c;
		  TD.appendChild(content);
		  TR.appendChild(TD);
		  
		  // Update old refs
		  old_x = this.db[i].x;
//		  old_y = this.db[i].y;
//		  old_z = this.db[i].z;
	  }
	  
	  return root;
  }
  
  // Cell Class
  
  function Cell (cell){
	  
	  this.x = ('undefined' !== typeof cell.x) ? cell.x : null;
	  this.y = ('undefined' !== typeof cell.y) ? cell.y : null;
	  this.z = ('undefined' !== typeof cell.z) ? cell.z : null;
	  
	  this.content = ('undefined' !== typeof cell.content) ? cell.content : '';
	  this.className = ('undefined' !== typeof cell.style) ? cell.style : null;
  };
  
	
})(('undefined' !== typeof node) ? node : module.parent.exports);
