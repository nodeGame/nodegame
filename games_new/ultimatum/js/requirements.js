/**
 * # Requirements for Ultimatum Game
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
function Requirements() {

    var stager = new node.Stager();
    var J = JSUS;

    var game = {};

    // Functions.

    function myInit() {
	var that = this;

        W.setup('SOLO_PLAYER');
        
	this.checkedIn = false;

    }

    function requirements() {

	node.window.loadFrame('/ultimatum/html/room/testing.html', function() {
            var div;
            div = W.getElementById('widgets_div');

            // Requirements Box.
            window.req = node.widgets.append('Requirements', div);
            
            req.onFail = function() {
                console.log('failed');
                window.feedback = node.widgets.append('Feedback', div);
            };

            req.onSuccess = function() {
                console.log('success');
            };


            function checkToken(result) {
                var token = J.getQueryString('id');
                node.get('MTID', function(authorized) {
                    var msg;
                    if (authorized.success) {
                        // No errors.
                        result([]);
                    }
                    else {
                        msg = 'Token authorization failed: ' + authorized.msg;
                        result([msg]);
                    }
                }, 'SERVER', token);
                
            }

            req.addRequirements(req.nodeGameRequirements,
                                checkToken);

            req.checkRequirements();
	});

       

	node.log('Testing requirements.');
    };

    // Setting the game plot

    stager.setOnInit(myInit);

    stager.addStage({
        id: 'requirements',
        cb: requirements,
        steprule: node.stepRules.WAIT
    });

    stager.init()
        .next('requirements');

    // Setting the property in game.

    game.plot  = stager.getState();

    game.metadata = {
        name: 'Ultimaum Requirements',
        description: 'Tests if the browser has the necessary requirement, the client is authorized, etc.',
        version: '0.1'
    };

    return game;
}