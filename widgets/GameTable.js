(function (exports) {

	var GameState = node.GameState;
	
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
		
		this.init(this.options);
	};
	
	GameTable.prototype.init = function (options) {
		
		this.gtbl = new node.window.Table({
											auto_update: true,
											id: options.id || this.options.id
		}, node.game.memory.db);
		if (options.render) {
			this.setRender(options.render);
		}
		
		//var glCopy = JSUS.clone(node.game.gameLoop);
		
		console.log('PRIMA');
		console.log(node.game.gameLoop);
		var state = new GameState();
		while (state) { 
			//console.log(glCopy);
			this.gtbl.addRow([state.toString()].concat(new Array(10)));
			var state = node.game.gameLoop.next(state);
		}
		console.log('DOPO');
		console.log(node.game.gameLoop);
		
		if (this.gtbl.size() === 0) {
			this.gtbl.table.appendChild(document.createTextNode('Empty table'));
		}
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
		node.on('in.set.DATA', function () {
			that.gtbl.db = node.game.memory.db;
			that.gtbl.parse(true);
		});
	}; 

})(node.window.widgets);