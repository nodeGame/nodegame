function Monitor_Example () {
	
	this.name = 'Peer Review Game Observer';
	this.description = 'General Description';
	this.version = '0.3';
	
	this.observer = true;	
	this.automatic_step = false;
//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	this.init = function() {
		node.window.setup('MONITOR');
		var that = this;
		
		var renderCF = function (cell) {
			// Check if it is really CF obj
			if (cell.content.head_radius) {
				var cf_options = { id: 'cf_' + cell.x,
						   width: 200,
						   height: 200,
						   features: cell.content,
						   controls: false
				};
				
				var container = document.createElement('div');
				var cf = node.window.addWidget('ChernoffFaces', container, cf_options);
				return container;
			}
		};
		
		this.summary = node.window.addWidget('GameTable', document.body, {render: renderCF});		
		
		this.dtable = node.window.addWidget('DynamicTable', document.body);
		this.dtable.binds.x = function(msg) {
			return node.game.pl.select('id', '=', msg.from).first().count;
		};
		this.dtable.binds.y = function(msg) {
			return node.game.pl.select('id', '=', msg.from).first().count;
		};
		
	};
	
	var pregame = function(){
		console.log('Pregame');
	};
	
	var instructions = function() {		
		console.log('Instructions');
	};
		
	var creation = function() {
		console.log('creation');
	};
	
	var submission = function() {
		//document.body.appendChild(this.summary.parse());
		console.log('submission');
	};
	
	var evaluation = function(){
		console.log('evaluation');
	};
	
	var dissemination = function(){
		console.log('dissemination');
	};
	
	var questionnaire = function() {
		console.log('Postgame');
	};
	
	var endgame = function() {
		console.log('Game ended');
	};
	
	var waiting = function(){
		console.log('Waiting');
	};
		
	var gameloop = { // The different, subsequent phases in each round
			
			1: {state: creation,
				name: 'Creation'
			},
			
			2: {state: submission,
				name: 'Submission'
			},
			
			3: {state: evaluation,
				name: 'Evaluation'
			},
			
			4: {state: dissemination,
				name: 'Exhibition'
			}
	};
		
	// LOOPS
	this.loops = {
			
			
			1: {state:	pregame,
				name:	'Game will start soon'
			},
			
			2: {state: 	instructions,
				name: 	'Instructions'
			},
				
			3: {rounds:	10, 
				state: 	gameloop,
				name: 	'Game'
			},
			
			4: {state:	questionnaire,
				name: 	'Questionnaire'
			},
				
			5: {state:	endgame,
				name: 	'Thank you'
			}
			
	};	
}