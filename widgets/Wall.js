(function (exports) {
	

	/*
	 * Wall
	 * 
	 * Prints lines sequentially;
	 * 
	 */
	
	exports.Wall = Wall;
	
	var JSUS = node.JSUS;
	
	Wall.id = 'wall';
	Wall.name = 'Wall';
	Wall.version = '0.3';
	
	Wall.dependencies = {
		JSUS: {}
	};
	
	function Wall (options) {
		this.id = options.id;		
		this.wall = null;
		this.buffer = [];
		this.counter = 0;
		// TODO: buffer is not read now
	};
	
	Wall.prototype.append = function (root, id) {
		var fieldset = node.window.addFieldset(root, this.id+'_fieldset', 'Game Log');
		var idLogDiv = id || this.id;
		this.wall = node.window.addElement('pre', fieldset, idLogDiv);
	};
	
	Wall.prototype.write = function(text) {
		if (document.readyState !== 'complete') {
	        this.buffer.push(s);
	    } else {
	    	var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
	    	this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
	        this.buffer = []; // Where to place it?
	    }  
	};
	
	Wall.prototype.listeners = function() {
		var that = this;
	//		this.game.on('in.say.MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
	//	
	//		this.game.on('out.say.MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
	//	
	//	
	//		this.game.on('MSG', function(p,msg){
	//			that.write(msg.toSMS());
	//		});
		
		node.on('LOG', function(msg){
			that.write(msg);
		});
	}; 
})(node.window.widgets);