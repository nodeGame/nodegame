(function (exports) {

	
	/*!
	 * GameSummary
	 * 
	 * Show Game Info
	 */
	
	exports.GameSummary	= GameSummary;
	
	GameSummary.id = 'gamesummary';
	GameSummary.name = 'Game Summary';
	GameSummary.version = '0.3';
	
	function GameSummary(options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = null;
		this.summaryDiv = null;
	}
	
	
	GameSummary.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idSummary = PREF + 'player';
		
		if (ids !== null && ids !== undefined) {
			if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
			if (ids.hasOwnProperty('player')) idSummary = ids.player;
		}
		
		this.fieldset = node.window.addFieldset(root, idFieldset, 'Game Summary');
		
		
		this.summaryDiv = node.window.addDiv(this.fieldset,idSummary);
		
		
		that.writeSummary();
			
		return this.fieldset;
		
	};
	
	GameSummary.prototype.writeSummary = function(idState,idSummary) {
		var gName = document.createTextNode('Name: ' + this.game.name);
		var gDescr = document.createTextNode('Descr: ' + this.game.description);
		var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
		var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.fieldset,this.summaryDiv,idSummary);
	};
	
	GameSummary.prototype.listeners = function() {}; 

})(node.window.widgets);