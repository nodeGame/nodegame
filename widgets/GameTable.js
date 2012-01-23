(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	
	/*!
	 * GameTable
	 * 
	 * Show the memory state of the game
	 */
	
	exports.GameTable = GameTable;
	
	function GameTable (options) {
		this.options = options;
		this.id = options.id || 'gametable';
		this.name = 'Game Table';
		this.version = '0.1';
		
		this.fieldset = { legend: this.name,
				  		  id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.gtbl = null;
		this.plist = null;
		
		console.log('Las opciones');
		console.log(this.options);
		
		this.init(this.options);
		
		
	};
	
	GameTable.prototype.init = function (options) {
		
		this.stateColumn = node.game.gameLoop.toArray();
		
		this.gtbl = new node.window.Table({
											auto_update: true,
											id: options.id || this.id,
											render: options.render
		}, node.game.memory.db);
		
		
		this.gtbl.set('state', GameState.compare);
		
		this.gtbl.setLeft([]);
		
		
		if (options.render) {
			this.setRender(options.render);
		}
		
//		if (this.gtbl.size() === 0) {
//			this.gtbl.table.appendChild(document.createTextNode('Empty table'));
//		}
		
		this.gtbl.parse(true);
	};
	
	GameTable.prototype.setRender = function(func) {
		this.gtbl.render = func;
	};
	
	GameTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.gtbl.table);
		return root;
	};
	
	GameTable.prototype.listeners = function () {
		var that = this;
		
		node.onPLIST(function(msg){
			var plist = new PlayerList(null,msg.data);
			if (plist.size() === 0) return;
			
			if (!that.plist) {
				that.plist = plist;
//				console.log('Created new plist in gtable');
//				console.log(that.plist);
				that.plist.forEach(function(el){that.addPlayer(el);});
			}
			else {
				var diff = plist.diff(that.plist);
//				console.log('THIS IS THE DIFF');
//				console.log(diff);
				if (diff) {
					diff.forEach(function(el){that.addPlayer(el);});
				}
//				console.log('added by diff');
				console.log(that.plist);
			}
			
			that.gtbl.parse(true);
		});
		
		node.on('in.set.DATA', function (msg) {
//			console.log(that.plist);
//			console.log(msg);
			that.addLeft(msg.state, msg.from);
			var x = that.player2x(msg.from);
			var y = that.state2y(node.game.gameState);
//			console.log('DATA RECEIVED')
//			console.log(x + ' ' + y);
			
			that.gtbl.add(msg.data, x, y);
			that.gtbl.parse(true);
			console.log(that.gtbl);
		});
	}; 
	
	GameTable.prototype.addPlayer = function (player) {
		var header = this.plist.map(function(el){return el.name});
		this.gtbl.setHeader(header);
		//this.gtbl.addColumn(new Array(node.game.gameLoop.length()));
		this.plist.add(player);
	};
	
	/**
	 * Check if 
	 */
	GameTable.prototype.addLeft = function (state, player) {
		if (!state) return;
		var state = new GameState(state);
		if (!JSUS.in_array(state, this.gtbl.left)){
			this.gtbl.add2Left(state.toString());
		}
		// Is it a new display associated to the same state?
		else {
			var y = this.state2y(state);
			var x = this.player2x(player);
			if (this.select('y','=',y).select('x','=',x).count() > 1) {
				this.gtbl.add2Left(state.toString());
			}
		}
		
		console.log(this.gtbl.left);
			
	};
	
	GameTable.prototype.player2x = function (player) {
		if (!player) return false;
		return this.plist.select('id', '=', player).first().count;
	};
	
	GameTable.prototype.x2Player = function (x) {
		if (!x) return false;
		return this.plist.select('count', '=', x).first().count;
	};
	
	GameTable.prototype.state2y = function (state) {
		if (!state) return false;
		return node.game.gameLoop.indexOf(state);
	};
	
	GameTable.prototype.y2State = function (y) {
		if (!y) return false;
		return node.game.gameLoop.jumpTo(new GameState(),y);
	};
	
	

})(node.window.widgets);