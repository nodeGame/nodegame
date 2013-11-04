/**
 * # Antechamber for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Incoming connections are validated:
 *
 * - Authorization
 * - Browser requirements
 *
 * On success, clients are sent to the real waiting room.
 * ---
 */
function antechamber() {
    
    var stager = new node.Stager();
    
    var node = parent.node,
    J = parent.JSUS;

    stager.setOnInit(function() {
	var that = this;
        var chat_div;

	this.checkedIn = false;
	chat_div = document.getElementById('chatDiv');

        
        // Chat div with the Monitor.
	this.chat = node.widgets.append('Chat', chat_div, {
            mode: 'ONE_TO_ONE',
            displayName: function() {
                return 'G.M.';
            }
        });
    });
    


    function requirements() {
	node.window.loadFrame('/ultimatum/html/room/testing.html', function(){
	    
            window.req = node.widgets.append('Requirements', document.body);
      
            function checkToken() {
                var token = J.
            }
            
            req.addRequirements(req.nodeGameRequirements,
                                checkToken);
            
            req.checkRequirements();
	});
	node.log('Testing requirements.');
    };
    
    stager.addStage({
        id: 'requirements'
        cb: requirements
        steprule: node.stepRules.WAIT
    });

    stager.init()
        .next('requirements');
    
    var game = {};

    game.plot  = stager.getState();

    game.metadata{
        name = 'Ultimaum Antechamber',
        description = 'Tests if the browser has the necessary requirement, the client is authorized, etc.',
        version = '0.1'
    };

    return game;
        
}