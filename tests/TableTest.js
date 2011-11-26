	function Table (options) {
		
		this.id = options.id || 'table';
	
		this.root = this.createRoot(this.id, options);
		this.pointer = this.root; // Points to the last row added;
	};
	
	Table.prototype.append = function(root) {
		return root.appendChild(this.write());
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
	
	Table.prototype.write = function() {
		//
	};
	
	Table.prototype.addRow = function (data, attributes, container) {
		var row = document.createElement('tr');
		
		for (var i = 0; i < data.length; i++) {
            var cell = document.createElement('td');
            var cellContent = document.createTextNode(data[i]);
            cell.appendChild(cellContent);
            row.appendChild(cell);
        } 
		
		// If we have other elements, e.g. thead
		if (container) {
			container.appendChild(row);
			row = container;
		}
		
		return this.appendRow(row);
	};
	
	Table.prototype.appendRow = function(row) {
		this.pointer.appendChild(row);
		this.pointer = row;
		return row;
	};
	
	Table.prototype.getRoot = function() {
		return this.root;
	};


var t = new Table();

var rows = 5;
var cols = [a,b,c,d];

for (var i=0; i < rows; i++) {
	t.addRow(cols);
}



