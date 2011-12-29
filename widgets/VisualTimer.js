(function (exports) {
	
	
	/*
	 * VisualTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualTimer	= VisualTimer;
	
	Utils = node.Utils;
	
	function VisualTimer (options) {
		var options = options || {};
		
		this.game = node.game;
		this.id = options.id || 'VisualTimer';
		this.name = 'Visual Timer';
		this.version = '0.3.2';
		
		this.timer = null; 		// the ID of the interval
		this.timerDiv = null; 	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = { legend: 'Time to go',
						  id: this.id + '_fieldset'
		};
		
		this.init(options);
	};
	
	VisualTimer.prototype.init = function (options) {
		if (this.timer) clearInterval(this.timer);
		this.milliseconds = options.milliseconds || 0;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.text = options.text || 'Time to go';
		this.event = options.event || 'TIMEUP'; // event to be fire		
		// TODO: update and milliseconds must be multiple now
	};
	
	VisualTimer.prototype.append = function (root) {
		var that = this;
//		var PREF = this.id + '_';
//		
//		var idFieldset = PREF + 'fieldset';
//		var idTimerDiv = PREF + 'div';
//		
//		if (ids !== null && ids !== undefined) {
//			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
//		}
//		
//		var fieldset = node.window.addFieldset(root, idFieldset, this.text);
		
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
			
		this.start();
		
		return root;
		
	};
	
	VisualTimer.prototype.start = function() {
		if (!this.milliseconds || this.milliseconds === 0){
			this.timerDiv.innerHTML = '0:0';
			return;
		}
		var that = this;
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