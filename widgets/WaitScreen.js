(function (exports) {
	

	/*
	 * Wait Screen
	 * 
	 * Show a standard waiting screen
	 * 
	 */
	
	exports.WaitScreen = WaitScreen;
	
	function WaitScreen (options) {
		
		this.game = node.game;
		this.id = options.id || 'waiting';
		this.name = 'WaitingScreen';
		this.version = '0.3';
		
		
		this.text = 'Waiting for other players to be done...';
		this.waitingDiv = null;
		
	}
	
	WaitScreen.prototype.append = function (root, id) {};
	
	WaitScreen.prototype.listeners = function () {
		var that = this;
		node.on('WAITING...', function (text) {
			console.log('WOWO');
			if (!that.waitingDiv) {
				that.waitingDiv = node.window.addDiv(document.body, that.id);
			}
			
			if (that.waitingDiv.style.display === 'none'){
				that.waitingDiv.style.display = '';
			}			
		
			that.waitingDiv.innerHTML = text || that.text;
			that.game.pause();
		});
		
		// It is supposed to fade away when a new state starts
		node.on('STATECHANGE', function(text) {
			if (that.waitingDiv) {
				
				if (that.waitingDiv.style.display == ''){
					that.waitingDiv.style.display = 'none';
				}
			// TODO: Document.js add method to remove element
			}
		});
		
	}; 
})(node.window.widgets);