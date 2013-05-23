/**
 * This is a game that spawns sub-games 
 * 
 */
module.exports = function(node, channel) {

	var stager = new node.Stager();
	
			
	// The client stages / steps and parameters 
	// are loaded. In this case from the file system, but it
	// could be from database. Everything should be loaded beforehand
	var client = require(__dirname + '/includes/game.client'); // path needs to be resolved at exec time;
	
	// The logic for this game is also loaded
	var logic = channel.require(__dirname + '/includes/game.logic');  // path needs to be resolved at exec time;
	
	stager.addStage(logic.stages.tutorial);
	stager.addStage(logic.stages.game);
	stager.addStage(logic.stages.questionnaire);
	
	// Set the game plot: the order and the conditions / repetitions
	// under which the stages of this game are executed
	
	stager.init()
		.next('tutorial')
		.next('game')
		.next('questionnaire')
		.gameover();	
	
    var game = {
        name: "mygame",
        stages: stager.getSequence()
    }
    	
	return game;
	
};;
