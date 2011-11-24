function PeerReviewGame () {
	
	this.name = 'Peer Review Game';
	this.description = 'Create, submit, and evaluate contributions from your peers.';
	this.version = '0.1';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 8;
	
	
	this.init = function() {			
		node.window.setup('PLAYER');
		this.cf = null;
		this.timer = null;
		this.header = document.getElementById('gn_header');
		this.vs = node.window.addWidget('VisualState', this.header);
	};
	
	
	
	var pregame = function() {

		
		var frame = node.window.loadFrame('pregame.html');
		node.emit('DONE');
		console.log('Pregame');
	};
	
	var instructions = function(){
		var that = this;
		node.window.loadFrame('instructions.html', function() {
			
			var b = node.window.getElementById('read');
			
			b.onclick = function() {
				node.DONE('Instructions have been read.');
				node.fire('WAIT');
			};
			
			node.random.emit('DONE',1000);
			
		});
		console.log('Instructions');
	};
	
	var creation = function(){
		var that = this;
		node.window.loadFrame('creation.html', function(){
			
			var root = node.window.getElementById('root');
			var cf_options = { id: 'cf',
								width: 300,
								height: 300
			};
			
			that.cf = node.window.addWidget('ChernoffFaces', root, cf_options);
			
			// Add timer
			var timerOptions = {
								event: 'CREATION_DONE',
								milliseconds: 1000
			};
			
			that.timer = node.window.addWidget('VisualTimer',root, timerOptions);
			
			node.on('CREATION_DONE', function(){
				node.set('CF', that.cf.getAllValues());
				node.emit('DONE');
			});
			
		});

		console.log('Creation');
	};
	
	var submission = function() {
		var that = this;
		var root = node.window.getElementById('root');
		
		var ctrl_options = { id: 'exhib',
							 name: 'exhib',
//							 fieldset: {
//										legend: 'Exhibitions'
//							 },
							 fieldset: false,
							 submit: false,
//							 submit: {
//								 		value: 'Submit'
//							 },
							 features: {
										ex_A: { 
											value: 'A',
											label: 'A'
										},
										ex_B: { 
												value: 'B',
												label: 'B'
										},
										ex_C: { 
												value: 'C',
												label: 'C'
										}
							}
		};
		
		node.window.addWidget('Controls.Radio',root,ctrl_options);
		
		// Add timer
		var timerOptions = {
							event: 'SUBMISSION_DONE',
							milliseconds: 1000
		};
		
		this.timer.restart(timerOptions);
		
		node.on('SUBMISSION_DONE', function(){
			//node.emit('HIDE','exhib');
			node.emit('INPUT_DISABLE');
			node.DONE();
		});
		
		console.log('Submission');
	};	
	
	var evaluation = function() {
		var that = this;
		var evas = {};
		var evaAttr = {
				min: 1,
				max: 9,
				step: 0.5,
				value: 4.5,
				label: 'Evaluation'
		};
		
		node.window.loadFrame('evaluation.html', function(){
		
			var root = node.window.getElementById('root');
			
			// Add timer
			var timerOptions = {
								event: 'EVALUATION_DONE',
								milliseconds: 10000
			};			
			var header = document.getElementById('gn_header');
			that.timer = node.window.addWidget('VisualTimer', header, timerOptions);
			
			node.onDATA('CF', function(msg) {
				console.log(msg);
				var cf_options = { id: 'cf',
								   width: 300,
								   height: 300,
								   features: msg.data.face,
								   controls: false
				};
	
				node.window.addWidget('ChernoffFaces', root, cf_options);
				
				 
				
				var evaId = 'eva_' + msg.data.from;
				node.window.writeln(root);
				
				// Add the slider to the container
				evas[msg.data.from] = node.window.addSlider(root, evaId, evaAttr);
			});
			
			
			node.on('EVALUATION_DONE', function(){
				
				for (var i in evas) {
					if (evas.hasOwnProperty(i)) {	
						node.set('EVA', {from: i,
										 eva: evas[i].value
						});
					}
				}
				node.emit('DONE');
			});
		});
		
		console.log('Evaluation');
	};
	
	var dissemination = function(){
		var that = this;
		node.window.loadFrame('dissemination.html');
		
//		node.on('in.say.DATA', function(msg) {
//			console.log('AAAAAAAAAAAAAAAAA');
//			console.log(msg.data);
//		});
		
		console.log('Dissemination');
	};
	
	var questionnaire = function(){
		var that = this;
		node.window.loadFrame('postgame.html');
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	
//	// Assigning Functions to Loops
//	
//	var pregameloop = {
//		1: pregame
//	};
//	
//	var instructionsloop = {
//		1: instructions
//	};
//	
//	var gameloop = { // The different, subsequent phases in each round
//		1: creation,
//		2: submission,
//		3: evaluation,
//		4: dissemination
//	};
//	
//	var postgameloop = {
//		1: questionnaire
//	};
//	
//	var endgameloop = {
//		1: endgame
//	};
//	
//	
//	// LOOPS
//	this.loops = {
//			1: {loop:pregameloop},
//			2: {loop:instructionsloop},
//			3: {rounds:10, loop:gameloop},
//			4: {loop:postgameloop},
//			5: {loop:endgameloop}
//		};	
	
	
// Assigning Functions to Loops
	
	
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