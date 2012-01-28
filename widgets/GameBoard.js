(function (exports) {
	
	/*!
	 * GameBoard
	 */ 
	
	exports.GameBoard = GameBoard;
	
	GameState = node.GameState;
	PlayerList = node.PlayerList;
	
	GameBoard.id = 'gboard';
	GameBoard.name = 'GameBoard';
	GameBoard.version = '0.3.1';
	
	function GameBoard (options) {
		
		this.id = options.id;
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
	}
	
	GameBoard.prototype.append = function(root) {
		this.root = root;
		var fieldset = node.window.addFieldset(root, this.id + '_fieldset', 'Game State');
		this.board = node.window.addDiv(fieldset,this.id);
		this.updateBoard(node.game.pl);
		
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		
		node.on('UPDATED_PLIST', function () {
			node.log('I Updating Board');
			that.updateBoard(node.game.pl);

		});
		
//		node.onPLIST( function (msg) {
//			node.log('I Updating Board ' + msg.text);
//			that.updateBoard(msg.data);
//		});
	};
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		that.board.innerHTML = 'Updating...';

		//node.log(pl);
		
		if (pl.size() !== 0) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//node.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = p.state.state + '.' + p.state.step + ':' + p.state.round; 
				pState += ' ';
				
				switch (p.state.is) {

					case GameState.iss.UNKNOWN:
						pState += '(unknown)';
						break;
						
					case GameState.iss.LOADING:
						pState += '(loading)';
						break;
						
					case GameState.iss.LOADED:
						pState += '(loaded)';
						break;
						
					case GameState.iss.PLAYING:
						pState += '(playing)';
						break;
					case GameState.iss.DONE:
						pState += '(done)';
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
	}
	
})(node.window.widgets);