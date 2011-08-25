/*!
 * 
 * List: handle list operation
 * 
 */

function List(id) {
	this.id = id || 'list';
	
	this.FIRST_LEVEL = 'dl';
	this.SECOND_LEVEL = 'dt';
	this.THIRD_LEVEL = 'dd';

	this.list = [];
}

List.prototype.append = function(root) {
	return root.appendChild(this.write());
};

List.prototype.add = function(elem) {
	this.list.push(elem);
};

List.prototype.write = function() {
	
	var root = document.createElement(this.FIRST_LEVEL);
	
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
	return document.createElement(this.FIRST_LEVEL);
};

List.prototype.getItem = function() {
	return document.createElement(this.SECOND_LEVEL);
};
