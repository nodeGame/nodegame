/**
 * # Requirements for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Incoming connections are validated:
 *
 * - Authorization
 * - Cookie Support
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
        console.log('INIT');
        W.setupFrame('SOLO_PLAYER');
    }

    function requirements() {
        
        var nLoads = 0;
	node.window.loadFrame('/ultimatum/html/room/testing.html', function() {
            var div, token;

            div = W.getElementById('widgets_div');
            token = J.getQueryString('id');

            // Requirements Box.
            window.req = node.widgets.append('Requirements', div, {
                // Automatically sends a SAY message with the outcome of the
                // tests, and the navigator.userAgent property.
                sayResults: true,
                // Mixin the properties of the object returned by the callback
                // with the default content of the SAY message. It can also
                // overwrite the defaults.
                addToResults: function() {
                    return { token: token };
                }
            });
            
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
                node.store.cookie('token', token);
            };

            // Synchronous callback function for the Requirements widget.
            // Returns an array containing a string for every error.
            // Empty array on success.
            function cookieSupport() {
                var errors = [];
                if ('undefined' === typeof node.store.cookie) {
                    errors.push('Cookie support must be enabled.');
                }
                return errors;
            }

            // Asynchronous callback function for the Requirements widget.
            // When the token has been validated on the server, it calls
            // the _result_ callback with the results of the validation
            // to be displayed on screen.
            function checkToken(result) {
               
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
                                cookieSupport,
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