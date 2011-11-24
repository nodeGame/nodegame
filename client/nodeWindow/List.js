(function(exports){
	
	/*!
	 * 
	 * List: handle list operation
	 * 
	 */
	
	exports.List = List;
	
	function List (options) {
		
		this.id = options.id || 'list';
		
		this.FIRST_LEVEL = 'dl';
		this.SECOND_LEVEL = 'dt';
		this.THIRD_LEVEL = 'dd';
	

		
		this.root = this.createRoot(this.id, options);
		
		this.list = [];
	}
	
	List.prototype.append = function(root) {
		return root.appendChild(this.write());
	};
	
	List.prototype.add = function(elem) {
		this.list.push(elem);
	};
	
	List.prototype.write = function() {
				
		var i = 0;
		var len = list.length;
		for (;i<len;i++) {
			var elem = document.createElement(this.SECOND_LEVEL);
			elem.appendChild(list[i]);
			root.appendChild(elem);
		}
		
		return root;
	};
	
	List.prototype.getRoot = function() {
		return this.root;
	};
	
	List.prototype.createRoot = function(id, options) {
		var root = document.createElement(this.FIRST_LEVEL);
		if (id) {
			root.id = id;
		}

		if (options.attributes) {
			
			node.window.addAttributes2Elem(root, options.attributes);
		}
		
		return root;
	};
	
	List.prototype.createItem = function(id) {
		var item = document.createElement(this.SECOND_LEVEL);
		if (id) {
			item.id = id;
		}
		return item;
	};
	
})(node.window);
