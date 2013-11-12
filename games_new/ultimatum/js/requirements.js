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
                var str, args;
                console.log('failed');
                str = '%spanYou are NOT allowed to take the HIT. If you ' +
                    'have already taken it, you must return it. You can ' +
                    'leave a feedback using the form below.%span';
                args = {
                    '%span': {
                        'class': 'requirements-fail'
                    }
                };
                W.sprintf(str, args, div);
                window.feedback = node.widgets.append('Feedback', div);
            };

            req.onSuccess = function() {
                var str, args;
                node.emit('HIDE', 'unsupported');
                str = '%spanYou are allowed to take the HIT.%span';
                args = {
                    '%span': {
                        'class': 'requirements-success'
                    }
                };
                W.sprintf(str, args, div);
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