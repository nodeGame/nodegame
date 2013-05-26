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

	stager.init()
        .next('tutorial')
        .next('game')
        .next('questionnaire')
        .gameover();
	
    var settings = {
        name: "mygame",
        stages: stager,
        gameover: logic.gameover,
        init: logic.init
    };
    	
	return settings;

};
