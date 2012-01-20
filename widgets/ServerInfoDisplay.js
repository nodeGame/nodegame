(function (exports) {
	

	/*
	 * ServerInfoDisplay
	 * 
	 * Sends STATE msgs
	 */
	
	exports.ServerInfoDisplay = ServerInfoDisplay;	
		
	function ServerInfoDisplay(options) {
		
		this.game = node.game;
		this.id = options.id || 'ServerInfoDisplay';
		this.name = 'Server Info Display';
		this.version = '0.1';
		
		this.fieldset = { legend: 'Server Info',
				  		  id: this.id + '_fieldset'
		};
		
		this.div = null;
		this.table = null; //new node.window.Table();
		
		var button = null;
		
	}
	
	ServerInfoDisplay.prototype.init = function (options) {
		if (!this.div) {
			this.div = document.createElement('div');
		}
		this.dib.innerHTML = 'Waiting for the reply from Server...';
		this.table.clear(true);
		this.button = document.createElement('button');
		this.button.value = 'Refresh';
		this.button.onclick = this.getInfo;
		this.getInfo();
	};
	
	ServerInfoDisplay.prototype.append = function (root) {
		this.root = node.window.addDiv(root,this.div);
		return root;
	};
	
	ServerInfoDisplay.prototype.getInfo = function() {
		node.get('INFO', function(info){
			this.div.innerHTML = this.processInfo(info);
		});
	};
	
	ServerInfoDisplay.prototype.processInfo = function(info) {
		for (var key in info) {
			if (info.hasOwnProperty(key)){
				this.table.addRow([key,info[key]]);
			}
		}
		return this.table.parse();
	};
	
	ServerInfoDisplay.prototype.listeners = function () {}; 
	
})(node.window.widgets);