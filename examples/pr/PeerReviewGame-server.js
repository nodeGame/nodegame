function Monitor_Example () {
	
	this.name = 'Peer Review Game Observer';
	this.description = 'General Description';
	this.version = '0.2';
	
	this.observer = true;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.automatic_step = false;
	
	this.init = function() {
		node.window.setup('MONITOR');
		
		var render = function (cell) {
			//if ((cell.y % 2) === 1) {
			if ('object' === typeof cell.content) {
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
			else {
				return cell.content;
			}
		};
		
		this.summary = node.window.addWidget('GameTable', document.body, {render: render});
		
//		this.summary = new node.window.Table({auto_update: true,
//											  id: 'summary'
//		});
//		
//		this.summary.render = function (cell) {
//			if ((cell.y % 2) === 1) {
//				var cf_options = { id: 'cf_' + cell.content.player,
//						   width: 200,
//						   height: 200,
//						   features: cell.content.value,
//						   controls: false
//				};
//				
//				var container = document.createElement('div');
//				var cf = node.window.addWidget('ChernoffFaces', container, cf_options);
//				return container;
//			}
//			else {
//				return cell.content.value;
//			}
//		};
		
		//document.body.appendChild(this.summary.table);
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