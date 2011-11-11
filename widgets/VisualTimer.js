(function (exports) {
	
	
	/*
	 * VisualTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualTimer	= VisualTimer;
	
	Utils = node.Utils;
	
	function VisualTimer(options) {
		
		this.game = node.game;
		this.id = options.id || 'VisualTimer';
		this.name = 'Visual Timer';
		this.version = '0.2.1';
		
		this.timer = null; 		// the ID of the interval
		this.timerDiv = null; 	// the DIV in which to display the timer
		this.root = null;		// the parent element
		
		this.init(options);
	};
	
	VisualTimer.prototype.init = function (options) {
		this.milliseconds = options.milliseconds || 10000;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.text = options.text || 'Time to go';
		this.event = options.event || 'TIMEUP'; // event to be fire		
		// TODO: update and milliseconds must be multiple now
	};
	
	VisualTimer.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idTimerDiv = PREF + 'div';
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		}
		
		var fieldset = node.window.addFieldset(root, idFieldset, this.text);
		this.root = root;
		this.timerDiv = node.window.addDiv(fieldset,idTimerDiv);
			
		this.start();
		
		return fieldset;
		
	};
	
	VisualTimer.prototype.start = function() {
		var that = this;
		console.log(this);
		// Init Timer
		var time = Utils.parseMilliseconds(this.milliseconds);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
		
		
		this.timer = setInterval(function() {
			that.timePassed = that.timePassed + that.update;
			var time = that.milliseconds - that.timePassed;

			if (time <= 0) {
				if (that.event) {
					node.emit(that.event);
				}
				clearInterval(that.timer);
				time = 0;
			}
			//console.log(time);
			time = Utils.parseMilliseconds(time);
			that.timerDiv.innerHTML = time[2] + ':' + time[3];
			
		}, this.update);
	};
	
	VisualTimer.prototype.restart = function(options) {
		this.init(options);
		this.start();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
				node.window.populateRecipientSelector(that.recipient,msg.data);
			}); 
	};
	
})(node.window.widgets);