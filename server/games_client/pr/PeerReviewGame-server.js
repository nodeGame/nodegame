function Monitor_Example () {
	
	this.name = 'Peer Review Game Observer';
	this.description = 'General Description';
	this.version = '0.3';
	
	this.observer = true;	
	
	// TODO: Check auto_step = false
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
				var cf = node.window.getWidget('ChernoffFaces', cf_options);
				return cf.getCanvas();
			}
		};
		
		this.summary = node.window.addWidget('GameTable', document.body, {render: renderCF});		
		
//		this.dtable = node.window.addWidget('DynamicTable', document.body, {replace: true});
//		this.dtable.addBind('x', function (msg) {
//			if (msg.text === 'WIN_CF') {
//				var out = [];
//				for (var i=0; i< msg.data.length; i++) {
//					var author = msg.data[i].author;
//					var x = node.game.pl.select('name', '=', author).first().count;
//					if (count) {
//						out.push(x);
//					}
//				}
//			}
//			return out;
//		};
//		this.dtable.addBind('y', function (msg) {
//			if (msg.text === 'WIN_CF') {
//				return [1,2,3];
//			}
//		};
//		
//		this.dtable.addBind('y', function (msg) {
//			if (msg.text === 'WIN_CF') {
//				return [1,2,3];
//			}
//		};
//		
//		this.dtable.addBind('content', function (msg) {
//			if (msg.text === 'WIN_CF') {
//				var out = [];
//				for (var i=0; i< msg.data.length; i++) {
//					out.push(msg.data.mean);
//				}
//			}
//		};
		
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