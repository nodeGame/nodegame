/**
 * This is a game that spawns sub-games 
 * 
 */
module.exports = function(node, channel) {

	var stager = new node.Stager();
		
	// The logic for this game is also loaded
	var logic = channel.require(__dirname + '/includes/game.logic');  // path needs to be resolved at exec time;
	
	stager.addStage(logic.tutorialStage);
	stager.addStage(logic.gameStage);
	stager.addStage(logic.questionnaireStage);

    // This returns NULL??
    console.log(stager.init().next('tutorial'))
	// Set the game plot: the order and the conditions / repetitions
	// under which the stages of this game are executed
	
	stager.init()
        .next('tutorial')
        .next('game')
        .next('questionnaire')
        .gameover();
	
    var game = {
        name: "mygame",
        stages: stager.getSequence(),
        gameover: logic.gameover,
        init: logic.init
    };
    	
	return game;

};
