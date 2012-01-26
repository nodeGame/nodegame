function PeerReviewGame () {
	
	this.name = 'Peer Review Game';
	this.description = 'Create, submit, and evaluate contributions from your peers.';
	this.version = '0.3';
	
	this.auto_step = false;
	this.auto_wait = true;
	
	this.minPlayers = 2;
	this.maxPlayers = 8;
	
	this.init = function() {			
		node.window.setup('PLAYER');
		this.cf = null;
		this.header = document.getElementById('gn_header');
		this.vs = node.window.addWidget('VisualState', this.header);
		this.timer = node.window.addWidget('VisualTimer', this.header);
		this.sd = node.window.addWidget('StateDisplay', this.header);
		this.outlet = null;
		this.exs = ['A','B','C'];
		this.donetxt = 'Done!';
		this.milli = 10000;
		this.milli_short = 1000;
		
		this.all_ex = new node.window.List({ id: 'all_ex',
											 title: 'History of previous exhibitions'
		});
		node.window.write(this.all_ex.getRoot(), document.body);
		
		// DTABLE
		this.dtable = node.window.addWidget('DynamicTable', document.body, {replace: true});
		this.dtable.setLeft(['Mean', 'N. of shows', 'Money Won']);
					
		var bindings = {
				x: function (msg) {
				if (msg.text === 'WIN_CF') {
					var out = [];
					for (var i=0; i< msg.data.length; i++) {
						var author = msg.data[i].author;
						var x = node.game.pl.select('name', '=', author).first().count;
						if ('undefined' !== typeof x) {
							out.push(x);
						}
					}
				}
				return out;
			},
				
			y: function (msg) {
				if (msg.text === 'WIN_CF') {
					return [1,2,3];
				}
			},

			cell: function (msg, cell) {
				if (msg.text === 'WIN_CF') {
					if (cell.y === 1) {
						console.log('header');
						console.log(this.header);
						console.log('cell.x');
						console.log(cell.x);
						var idx = this.header[cell.x].content;
						if (!cell.history) cell.history = [];
						for (var i=0; i< msg.data.length; i++) {
							if (msg.data[i].author === idx) {
								cell.history.push(msg.data[i].mean);
							}
						}
						var mean = 0;
						for (var i=0; i < cell.history.length; i++) {
							mean += new Number(cell.history[i]); 
						}
						cell.content = (mean / cell.history.length).toFixed(2);
						
						
					}
					else if (cell.y === 2) {
						if (!cell.content) {
							cell.content = 1;
						}
						else {
							cell.content += 1;
						}
					
					}
					else {
						if (!cell.content) {
							cell.content = 1;
						}
						else {
							cell.content += 1;
						}
					}
					return cell;	
				}
			}
		};
		
		
		this.dtable.bind('in.say.DATA', bindings);
		
		this.dtable.bind('in.say.PLIST', {
									header: function (msg) {
										if (msg.data.length === 0) return;
										var plist = new node.PlayerList({}, msg.data);
										var out = plist.map(function(player){
											return player.name;
										});
										return out;
									}
		});
		// End TABLE
		
	};
	
	
	
	var pregame = function() {
		var frame = node.window.loadFrame('pregame.html');
		node.emit('DONE');
		console.log('Pregame');
	};
	
	var instructions = function(){
		node.window.loadFrame('instructions.html', function() {
			
			var b = node.window.getElementById('read');
			
			b.onclick = function() {
				node.DONE('Instructions have been read.');
				node.fire('WAIT');
			};
			
			node.random.emit('DONE',100);
			
		});
		console.log('Instructions');
	};
	
	var creation = function(){

		node.window.loadFrame('creation.html', function(){
			
			var root = node.window.getElementById('root');
			var cf_options = { id: 'cf',
								width: 300,
								height: 300
			};
			
			this.cf = node.window.addWidget('ChernoffFaces', root, cf_options);
			// AUTOPLAY
			this.cf.randomize();
			
			// Add timer
			var timerOptions = {
								event: 'CREATION_DONE',
								milliseconds: this.milli_short
			};
			
			node.window.addEventButton('CREATION_DONE', this.donetxt);
			
			this.timer.restart(timerOptions);
			
			node.on('CREATION_DONE', function(){
				node.set('CF', this.cf.getAllValues());
				node.emit('DONE');
			});
			
		});

		console.log('Creation');
	};
	
	var submission = function() {
		var root = node.window.getElementById('root');
		
		node.emit('INPUT_DISABLE');
		
		var ctrl_options = { id: 'exhib',
							 name: 'exhib',
							 fieldset: {
										legend: 'Exhibitions'
							 },
							 //change: 'SUBMISSION_DONE',
							 //fieldset: false,
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
		
		this.outlet = node.window.addWidget('Controls.Radio',root,ctrl_options);
		
		// AUTOPLAY
		node.random.exec(function(){
			var choice = Math.random();
			if (choice < 0.33) {
				node.window.getElementById('ex_A').click();
			}
			else if (choice < 0.66) {
				node.window.getElementById('ex_B').click();
			}
			else {
				node.window.getElementById('ex_C').click();
			}
		}, 10);
		
		
		
		// Add timer
		var timerOptions = {
							event: 'SUBMISSION_DONE',
							milliseconds: this.milli_short
		};
		
		
		node.window.addEventButton('SUBMISSION_DONE', this.donetxt);
		
		this.timer.restart(timerOptions);
		
		node.on('SUBMISSION_DONE', function(){
			if (!this.outlet.hasChanged) {
				this.outlet.highlight();
				alert('You must select an outlet for your creation NOW!!');
				this.timer.restart(timerOptions);
			}
			else {
				node.emit('INPUT_DISABLE');
				node.set('SUB', this.outlet.getAllValues());
				node.DONE();
			}
		});
		
		console.log('Submission');
	};	
	
	var evaluation = function() {
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
								milliseconds: this.milli_short
			};	
			
			this.timer.restart(timerOptions);
			
			node.onDATA('CF', function(msg) {
				
				var cf_options = { id: 'cf',
								   width: 300,
								   height: 300,
								   features: msg.data.face,
								   controls: false
				};
	
				node.window.addWidget('ChernoffFaces', root, cf_options);
				
				 
				
				var evaId = 'eva_' + msg.data.from;
				node.window.writeln();
				
				// Add the slider to the container
				evas[msg.data.from] = node.window.addSlider(root, evaId, evaAttr);
				
				node.window.addEventButton('EVALUATION_DONE', this.donetxt);
				
				// AUTOPLAY
				node.random.exec(function(){
					var choice = Math.random();
					
					node.window.getElementById(evaId).value = Math.random()*10;
					
					//alert(choice);
					
				}, 10);
			});
			
			
			
			node.on('EVALUATION_DONE', function(){
				
				for (var i in evas) {
					if (evas.hasOwnProperty(i)) {	
						node.set('EVA', {'for': i,
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
		node.window.loadFrame('dissemination.html', function() {
			var root = node.window.getElementById('root');
			
			var table = new node.window.Table({className: 'exhibition'});
			table.setHeader(['Rank','A','B','C']);
			table.addColumn([1,2,3]);
			
			node.onDATA('WIN_CF', function(msg) {
				
				if (msg.data.length > 0) {
					var db = new node.NDDB(null,msg.data);
					
					for (var j=0; j < this.exs.length; j++) {
						var winners = db.select('ex','=',this.exs[j])
										.sort('mean')
										.reverse()
										.fetch();
					
						if (winners.length > 0) {
							var column = [];
							for (var i=0; i < winners.length; i++) {1
							
								var details_tbl = new node.window.Table();
								details_tbl.addColumn(['Author: ' + winners[i].author,
								                       'Score: ' + winners[i].mean
								]);
								
								var cf_options = { id: 'cf_' + winners[i].player,
										   width: 200,
										   height: 200,
										   features: winners[i].cf,
										   controls: false
								};
								
								
								var container = document.createElement('div');
								
								var cf = node.window.addWidget('ChernoffFaces', container, cf_options);
								container.appendChild(details_tbl.parse());
								column.push(container);
							}
							table.addColumn(column);
						}
						else {
							table.addColumn(['No creation was selected for exhibition ' + this.exs[j]]);
						}
					}
				}
				else {
					node.window.write('No work was selected to be published in any exhibition', root);
				}
				
				// Styling the table
				table.select('y', '=', 0).addClass('first');
				table.select('y', '=', 1).addClass('second');
				table.select('y', '=', 2).addClass('third');
				table.select('y', '>', 2).addClass('other');
				
				root.appendChild(table.parse());
				
				node.window.addEventButton('DONE', this.donetxt);
				
				this.timer.restart({
									event: 'DONE',
									milliseconds: this.milli
				});	
				
				
//				this.all_ex.addDT(table.table);
//				this.all_ex.parse();
				
			});
			
			
			
		});
		
		
		
		console.log('Dissemination');
	};
	
	var questionnaire = function(){
		node.window.loadFrame('postgame.html', function(){
			
			node.window.addEventButton('DONE', this.donetxt);
			
			this.timer.restart({
								event: 'DONE',
								milliseconds: this.milli_short
			});
		});
		
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	
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