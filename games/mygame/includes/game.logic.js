var game = {};

module.exports = game;

//The stages / steps of the logic are defined here
// but could be loaded from the database

var tutorialStage = {
	 	id: 'tutorial',
		cb: function() {
			
			// everybody plays the same stage 
			// as it was defined in game.client, 
			// and already setup on the client
			var playersMap = node.RoleMapper('ALL', 'tutorial');
		
			channel.startSubGame({
				id: 'tutorial',
				players: playersMap
				// no logic process will be loaded, 
				// clients will just exchange messages
				// and their exchange registered
				// No special variables are passed
				// logics: null,
				// env: null,
			});
			
		},
		onexit: function() {
			
			// We can decide on real time how the game develops
//				if (node.game.globals.A) {
//					node.game.plot.next('gameA');
//				}
//				else {
//					node.game.plot.next('gameB');
//				}
			
		}
};

var gameStage = {
		id: 'game',
		init: function() {
			// something
			return true;
		},
		cb: function() {

			// creates groups here
			
			var groups = node.GroupManager(node.game.pl, {
				size: 2,
				remaining: 'ADD'
			});
			    
			// Setting up each client
			groups.each(function(group) {	
				var CLIENT_B = group[0];
				var CLIENT_A = group[1];
			    
				var rolesMap = node.RoleMapper({
					BIDDER: {
						player: CLIENT_B,
						stage: 'bidder',
						env: {
							otherVar: 'foo1'
						}},
					},
					RESPONDENT: {
						player: CLIENT_A,
						stage: 'respondent',
						env: {
							otherVar: 'foo2'
						}},
					}
				});
				
				channel.startSubGame({
					id: 'gameround',
					players: rolesMap,
					// no logic process will be loaded, 
					// clients will just exchange messages
					// and their exchange registered
					// No special variables are passed
					// logics: null,
					// env: null,
				});
				
			});
		}
};

var questionnaireStage = {
	 	id: 'questionnaire', 
		cb: function() {
			
			// everybody plays the same stage 
			// as it was defined in game.client, 
			// and already setup on the client
			var playersMap = node.RoleMapper('ALL', 'questionnaire');
			
			channel.startSubGame({
				id: 'questionnaire',
				players: playersMap
				// no logic process will be loaded, 
				// clients will just exchange messages
				// and their exchange registered
				// No special variables are passed
				// logics: null,
				// env: null,
			});
			
			
			// Alternatively we could not spawn a subgame 
			// and directly invoke a new stage on all the clients
			// maybe it is confusing for the developer though
			// node.remote.gamecommand('exec', 'questionnaire');

			
		}
};


game.stages = [ tutorialStage, gameStage, questionnaireStage];

game.init = function(); // optional
game.gameover = function(); // optional
