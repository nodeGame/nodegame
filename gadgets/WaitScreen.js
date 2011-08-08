/*
 * Wait Screen
 * 
 * Show a standard waiting screen
 * 
 */

//var waitScreen = function(){

function WaitScreen(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'waiting';
	this.name = 'WaitingScreen';
	this.version = '0.2.1';
	
	
	this.text = 'Waiting for other players...';
	this.waitingDiv = null;
	
}

WaitScreen.prototype.append = function (root, id) {};

WaitScreen.prototype.listeners = function () {
	var that = this;
	node.on('WAIT', function(text) {
		that.waitingDiv = nodeWindow.addDiv(document.body, that.id);
		if (that.waitingDiv.style.display === "none"){
			that.waitingDiv.style.display = "";
		}
	
		that.waitingDiv.appendChild(document.createTextNode(that.text || text));
		that.game.pause();
	});
	
	// It is supposed to fade away when a new state starts
	node.on('STATECHANGE', function(text) {
		if (that.waitingDiv) {
			
			if (that.waitingDiv.style.display == ""){
				that.waitingDiv.style.display = "none";
			}
		// TODO: Document.js add method to remove element
		}
	});
	
}; 