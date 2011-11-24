(function (exports) {
	
	
	/*
	 * VisualState
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualState	= VisualState;
	
	GameState = node.GameState;
	Utils = node.Utils;
	
	function VisualState (options) {
		this.game = node.game;
		this.id = options.id || 'VisualState';
		this.name = 'Visual State';
		this.version = '0.1';
		this.gameLoop = this.game.gameLoop;
		
		this.root = null;		// the parent element
		
		//this.init(options);
	};
	
	VisualState.prototype.init = function (options) {
		this.milliseconds = options.milliseconds || 10000;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.text = options.text || 'Time to go';
		this.event = options.event || 'TIMEUP'; // event to be fire		
		// TODO: update and milliseconds must be multiple now
	};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idTimerDiv = PREF + 'div';
		

		this.stateDiv = node.window.addDiv(root,idTimerDiv);
		this.stateDiv.innerHTML = new GameState(this.game.gameState);
		
		return root;
		
	};
	
	VisualState.prototype.start = function() {
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
	
	VisualState.prototype.restart = function(options) {
		this.init(options);
		this.start();
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;

		
		node.on('STATECHANGE', function() {
			console.log('VISUAL STATE');
			that.stateDiv.innerHTML = new GameState(this.game.gameState);
		}); 
	};
	
})(node.window.widgets);