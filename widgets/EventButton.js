(function (exports) {
	
	
	/*
	 * EventButton
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.EventButton	= EventButton;
	
	JSUS = node.JSUS;
	
	EventButton.id = 'eventbutton';
	EventButton.name = 'Event Button';
	EventButton.version = '0.2';
	EventButton.dependencies = {
		JSUS: {}
	};
	
	function EventButton (options) {
		this.options = options;
		this.id = options.id;

		
		this.root = null;		// the parent element
		this.text = 'Send';
		this.button = document.createElement('button');
		this.func = options.exec || null;
		this.init(this.options);
	};
	
	EventButton.prototype.init = function (options) {
		var options = options || this.options;
		this.button.id = options.id || this.id;
		var text = options.text || this.text;
		while (this.button.hasChildNodes()) {
			this.button.removeChild(this.button.firstChild);
		}
		this.button.appendChild(document.createTextNode(text));
		this.event = options.event || this.event;
		this.func = options.callback || this.func;
		var that = this;
		if (this.event) {
			// Emit Event only if callback is successful
			this.button.onclick = function() {
				var ok = true;
				if (options.callback) ok = options.callback.call(node.game);
				if (ok) node.emit(that.event);
			}
		}
		
		// Emit DONE only if callback is successful
		this.button.onclick = function() {
			var ok = true;
			if (options.exec) ok = options.exec.call(node.game);
			if (ok) node.emit(that.event);
		}
	};
	
	EventButton.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.button);
		return root;	
	};
	
	EventButton.prototype.listeners = function () {};
		
	// Done Button

	exports.DoneButton = DoneButton;
	
	DoneButton.prototype.__proto__ = EventButton.prototype;
	DoneButton.prototype.constructor = DoneButton;
	
	DoneButton.id = 'donebutton';
	DoneButton.version = '0.1';
	DoneButton.name = 'Done Button';
	DoneButton.dependencies = {
		EventButton: {}
	}
	
	function DoneButton (options) {
		options.event = 'DONE';
		options.text = options.text || 'Done!';
		EventButton.call(this, options);
	};
	
})(node.window.widgets);