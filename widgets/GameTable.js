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
		
		this.init(this.options);
		
		
	};
	
	GameTable.prototype.init = function (options) {
		
		this.stateColumn = node.game.gameLoop.toArray();
		
		this.gtbl = new node.window.Table({
											auto_update: true,
											id: options.id || this.options.id,
											render: options.render
		}, node.game.memory.db);
		
		this.gtbl.setLeft(node.game.gameLoop.toArray());
		
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
			var x = that.plist.select('id', '=', msg.from).first().count;
			var y = node.game.gameLoop.indexOf(node.game.gameState);
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

})(node.window.widgets);