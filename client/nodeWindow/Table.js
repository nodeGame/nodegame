(function(exports){
	
	/*!
	 * 
	 * Table: abstract representation of an HTML table
	 * 
	 */
	
	exports.Table = Table;
	
	function Table (options) {
		
		this.id = options.id || 'list';
		
		this.TR = 'tr';
		this.TD = 'td';
	
		this.root = this.createRoot(this.id, options);
		
		this.list = [];
	}
	
	Table.prototype.append = function(root) {
		return root.appendChild(this.write());
	};
	
	Table.prototype.add = function(elem) {
		this.list.push(elem);
	};
	
	Table.prototype.write = function() {
				


        // creates a <table> element and a <tbody> element
        var tbl     = document.createElement("table");
        var tblBody = document.createElement("tbody");

        // creating all cells
        for (var j = 0; j < 2; j++) {
            // creates a table row
            var row = document.createElement("tr");

            for (var i = 0; i < 2; i++) {
                // Create a <td> element and a text node, make the text
                // node the contents of the <td>, and put the <td> at
                // the end of the table row
                var cell = document.createElement("td");
                var cellText = document.createTextNode("cell is row "+j+", column "+i);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }

            // add the row to the end of the table body
            tblBody.appendChild(row);
        }

        // put the <tbody> in the <table>
        tbl.appendChild(tblBody);
        // appends <table> into <body>
        body.appendChild(tbl);
        // sets the border attribute of tbl to 2;
        tbl.setAttribute("border", "2");
	  
		
		return root;
	};
	
	Table.prototype.getRoot = function() {
		return this.root;
	};
	
	Table.prototype.createRoot = function(id, options) {
		var root = document.createElement(this.FIRST_LEVEL);
		if (id) {
			root.id = id;
		}

		if (options.attributes) {
			
			node.window.addAttributes2Elem(root, options.attributes);
		}
		
		return root;
	};
	
	Table.prototype.createItem = function(id) {
		var item = document.createElement(this.SECOND_LEVEL);
		if (id) {
			item.id = id;
		}
		return item;
	};
	
})(node.window);
