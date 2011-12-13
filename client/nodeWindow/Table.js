(function(exports){
	
	/*!
	 * 
	 * Table: abstract representation of an HTML table
	 * 
	 */
	
	exports.Table = Table;
	
  function Table (options) {
	    
	this.id = options.id || 'table';  
    
	if (options.root) {
		this.setRoot(options.root);
	}
	else {
		this.root = this.createRoot(this.id, options);
	}
    
    this.pointer = this.root; // Points to the last row added;
    this.odd = 'odd';
  };
  
  Table.prototype.setRoot = function(root) {
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
  
  Table.prototype.addRow = function (data, attributes, container) {
    var row = document.createElement('tr');
    
    if (attributes) {
    	node.window.addAttributes2Elem(row, attributes);
    }
    
    for (var i = 0; i < data.length; i++) {
            var cell = document.createElement('td');
            var cellContent = document.createTextNode(data[i]);
            cell.appendChild(cellContent);
            row.appendChild(cell);
        } 
    
    // If we have other elements, e.g. thead, add them. 
    // If it is not a normal no even or odd class is added.
    if (container) {
      container.appendChild(row);
      return this.appendRow(container, false);
    }
    else {
      return this.appendRow(row);
    }
    
  };
  
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
  
  Table.prototype.addColumn = function (data, attributes, container) {
  
  };
  
  Table.prototype.getRoot = function() {
    return this.root;
  };
	
})(node.window);
