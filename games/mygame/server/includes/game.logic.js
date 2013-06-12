var channel = module.parent.exports.channel;

var client = channel.require(__dirname + '/includes/game.client');  

var clientStager = client.stager;

var logic = {};

module.exports = logic;

logic.globals = {
    g1: "G1"
};


//The stages / steps of the logic are defined here
// but could be loaded from the database

logic.init = function(

    node.remoteSetup('game', 'ALL', {});
);

logic.tutorialStage = {
    id: 'tutorial',
    init: function() {
	// Do something
    },
    // TODO not to himself
    eachPlayer: function(p) {
	node.remoteSetup('plot', p.id, clientStager.extractStage('tutorial')); // two steps
    },
    eachMonitor: function(m) {
	// nothing
    },
    each: function(c) {
	
    },
    cb: function() {
        console.log('TUTORIAL STAGE');
        return;
    },

};

logic.gameStage = {
    id: 'game',
    init: function() {
        console.log('INITING THE GAME STAGE');
        // something
        return true;
    },
    eachClient: function(p) {
	node.remoteSetup('plot', p.id, clientStager.extractStage('game')); // two steps
    },
    cb: function() {
        console.log('GAME STAGE');
        return;
    }

};

logic.questionnaireStage = {
    id: 'questionnaire',
    eachClient: function(p) {
	node.remoteSetup('plot', p.id, clientStager.extractStage('questionnaire')); // one step
    },
    cb: function() {
        console.log('QUESTIONNAIRE STAGE');
        return;
    }
};


