(function (exports) {
	

	/*
	 * Wait Screen
	 * 
	 * Show a standard waiting screen
	 * 
	 */
	
	exports.WaitScreen = WaitScreen;
	
	WaitScreen.id = 'waiting';
	WaitScreen.name = 'WaitingScreen';
	WaitScreen.version = '0.3.1';
	
	function WaitScreen (options) {
		this.id = options.id;
		
		this.text = 'Waiting for other players to be done...';
		this.waitingDiv = null;
	};
	
	WaitScreen.prototype.append = function (root, id) {};
	
	WaitScreen.prototype.listeners = function () {
		var that = this;
		node.on('WAITING...', function (text) {
			if (!that.waitingDiv) {
				that.waitingDiv = node.window.addDiv(document.body, that.id);
			}
			
			if (that.waitingDiv.style.display === 'none'){
				that.waitingDiv.style.display = '';
			}			
		
			that.waitingDiv.innerHTML = text || that.text;
			node.game.pause();
		});
		
		// It is supposed to fade away when a new state starts
		node.on('LOADED', function(text) {
			if (that.waitingDiv) {
				
				if (that.waitingDiv.style.display == ''){
					that.waitingDiv.style.display = 'none';
				}
			// TODO: Document.js add method to remove element
			}
		});
		
	}; 
})(node.window.widgets);