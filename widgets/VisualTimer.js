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
		this.version = '0.1';
		
		this.milliseconds = options.milliseconds || 10000;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.timer = null;
		this.timerDiv = null;
		this.root = null;
		this.text = options.text || 'Time to go';
		this.event = options.event || 'TIMEUP'; // event to be fire
		
		
		// TODO: update and milliseconds must be multiple now
		
		this.recipient = null;
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

		this.timerDiv = node.window.addDiv(fieldset,idTimerDiv);
		
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
		
		
		return fieldset;
		
	};
	
	VisualTimer.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
				node.window.populateRecipientSelector(that.recipient,msg.data);
			}); 
	};
	
})(node.window.widgets);