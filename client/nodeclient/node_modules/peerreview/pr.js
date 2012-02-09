if ('object' === typeof module && 'function' === typeof require) {
	module.exports = PeerReview;
	var node = module.parent.exports.node;
}

function PeerReview () {
	
	this.name = 'Game Example';
	this.description = 'General Description';
	this.version = '0.2';
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.automatic_step = true;
	
	this.init = function() {
		this.threshold = 3;
	};
	
	var pregame = function () {
		console.log('Pregame');
	};
	
	var instructions = function () {	
		console.log('Instructions');
	};
		
	var creation = function () {
		console.log('creation');
	};
	
	var submission = function(){		
		console.log('submission');
	};
	
	var evaluation = function(){
		
		// TODO: expose these methods from the node obj
		var faces = this.memory.select('state', '=', this.previous(2))
							   .select('key', '=', 'CF')
							   .fetch();
		
		var matches = [[1,2]];
		do {
			matches = node.utils.matchN(faces,1,true);
		} while (!matches[matches.length-1][1]);
		
//		console.log('STEEEE');
//		console.log(matches);
//		
		for (var i=0; i < matches.length; i++) {
			// idx=1 is the other player
			// TODO: find a way to automatize it
			var data = {face: matches[i][0].value,
						from: matches[i][0].player
			};
			//console.log(matches[i][0].player + ' ' + matches[i][1].player);
			node.say(data, 'CF', matches[i][1].player);
		}
		
		console.log('evaluation');
	};
	
	var dissemination = function(){
		// For each exhibition
		// get all the evaluations for each submission
		var exhibs = this.memory.select('state', '>=', this.previous(2))
								.join('player', 'value.for', 'EVA2', ['value'])
								.select('EVA2')
								.select('key','=','SUB')
								.sort('value')
								.reverse()
								.groupBy('value');
		
		var selected = [];
		// Exhibitions Loop
		for (var i=0; i < exhibs.length; i++) {
			
//			console.log('EX ' + i);
//			console.log(exhibs[i].fetch()[0].EVA2);
			
			// Get the list of works per exhibition
			var works = exhibs[i].groupBy('EVA2.value');
			
			
			// Evaluations Loop
			for (var j=0; j < works.length; j++) {
	
//				console.log('work');
//				console.log(works[j].first().EVA2);
				
				var mean = works[j].mean('EVA2.value.eva'); 
				
//				console.log('Mean: ' + mean);
//				console.log('T: ' + this.threshold);
				
				// Threshold
				if (mean > this.threshold) {	
					
					//var player = works[j].fetch()[0].player;
					var player = works[j].first().player;
					
					var cf = this.memory.select('state', '=', this.previous(3))
										.select('player', '=', player)
										.select('key', '=', 'CF');
				
					
//					console.log('cf');
//					console.log(cf);
					
					var author = this.pl.select('id', '=', player).first();
				
					selected.push({ex: works[j].first().value,
								   mean: mean.toFixed(2),
								   author: author.name,
								   cf: cf.first().value});
					
				}
				
				
				
				
			}
		}

//		console.log('SELECTED');
//		console.log(selected);
		//console.log(this.memory.db);
		node.say(selected, 'WIN_CF', 'ALL')

		
		console.log('dissemination');
	};
	
	var questionnaire = function() {
		console.log('Postgame');
	};
	
	var endgame = function() {
		node.memory.dump('./pr.csv', true);
		console.log('Game ended');
		
		node.random.exec(function(){
			node.replay(true);
		},1000);
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