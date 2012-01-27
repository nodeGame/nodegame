(function (exports) {
	
	
	/*
	 * DoneButton
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.DoneButton	= DoneButton;
	
	JSUS = node.JSUS;
	
	DoneButton.name = 'Done Button';
	DoneButton.version = '0.1';
	DoneButton.dependencies = {
		JSUS: {}
	};
	
	function DoneButton (options) {
		this.options = options;
		this.id = options.id || 'donebutton';

		
		this.root = null;		// the parent element
		this.text = 'Done!';
		this.button = document.createElement('button');
		this.func = options.exec || null;
		this.init(this.options);
	};
	
	DoneButton.prototype.init = function (options) {
		var options = options || this.options;
		this.button.id = options.id || this.id;
		var text = options.text || this.text;
		while (this.button.hasChildNodes()) {
			this.button.removeChild(this.button.firstChild);
		}
		this.button.appendChild(document.createTextNode(text));
		this.func = options.exec || this.func;
		// Emit DONE only if callback is successful
		this.button.onclick = function() {
			var ok = true;
			if (options.exec) ok = options.exec.call(node.game);
			if (ok) node.emit('DONE');
		}
	};
	
	DoneButton.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.button);
		return root;	
	};
	
	DoneButton.prototype.updateDisplay = function () {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0){
			this.timerDiv.innerHTML = '0:0';
			return;
		}
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
	};
	
	DoneButton.prototype.listeners = function () {
		var that = this;
		node.on('LOADED', function() {
		
			var done = node.game.gameLoop.getAllParams(node.game.gameState).done;
			if (done) {
				// TODO: check for other options
				that.init({exec: done});
			}
		});
	};
	
})(node.window.widgets);