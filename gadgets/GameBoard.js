(function (exports) {
	
	/*!
	 * GameBoard
	 */ 
	
	exports.GameBoard = GameBoard;
		
	function GameBoard (id) {
		
		this.game = node.game;
		this.id = id || 'gboard';
		this.name = 'GameBoard';
		
		this.version = '0.2.1';
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
	}
	
	GameBoard.prototype.append = function(root) {
		this.root = root;
		var fieldset = node.window.addFieldset(root, this.id + '_fieldset', 'Game State');
		this.board = node.window.addDiv(fieldset,this.id);
		this.board.innerHTML = this.noPlayers;
		
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		node.onPLIST( function (msg) {
			console.log('I Updating Board ' + msg.text);
			that.board.innerHTML = 'Updating...';
			
			var pl = new node.PlayerList(msg.data);
			
			//console.log(pl);
			
			if (pl.size() !== 0) {
				that.board.innerHTML = '';
				pl.forEach( function(p) {
					//console.log(p);
					var line = '[' + p.id + "|" + p.name + "]> \t"; 
					
					var pState = p.state.state + '.' + p.state.step + ':' + p.state.round; 
					pState += ' ';
					
					switch (p.state.is) {
					
					case node.states.UNKNOWN:
						pState += '(unknown)';
						break;
					case node.states.PLAYING:
						pState += '(playing)';
						break;
					case node.states.DONE:
						pState += '(done)';
						break;	
					case node.states.PAUSE:
						pState += '(pause)';
						break;		
					default:
						pState += '('+p.state.is+')';
						break;		
					}
					
					if (p.state.paused) {
						pState += ' (P)';
					}
					
					that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
				});
				//this.board.innerHTML = pl.toString('<hr style="color: #CCC;"/>');
				}
				else {
					that.board.innerHTML = that.noPlayers;
				}
			});
	};
})(node.window.gadgets);