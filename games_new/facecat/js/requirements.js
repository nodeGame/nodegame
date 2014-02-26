/**
 * # Requirements for Face Categorization Game
 * Copyright(c) 2014 Stefano Balietti
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

    var J = JSUS;

    var div, token, errToken;

    var gameLink;

    div = W.getElementById('widgets_div');
    token = J.getQueryString('id');

    if ('string' !== typeof token || token === '') {
        alert('Ooops. You are missing the access code. This is likely to be ' +
              'due to a technical error on our server.\n\nPlease return the ' +
              'HIT immediately, and look for a HIT called "ETH Descil Trouble ' +
              'Ticket for NodeGame". Please report your worker id, your ' +
              'browser, and the steps you have followed to accept this HIT. ' +
              'You will receive a compensation of 0.25 USD for your trouble. ' +
              'Compensantion can be claimed only once.' +
              '\n\nThank you very much for your collaboration.');
        return;
    }


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
            'have already taken it, you must return it.%span';
        args = {
            '%span': {
                'class': 'requirements-fail'
            }
        };
        W.sprintf(str, args, div);

        // You can leave a feedback using the form below.
        // window.feedback = node.widgets.append('Feedback', div);
    };

    req.onSuccess = function() {
        var str, args;
        var button, link;
        node.emit('HIDE', 'unsupported');
        str = '%spanYou are allowed to take the HIT.%span';
        args = {
            '%span': {
                'class': 'requirements-success'
            }
        };
        W.sprintf(str, args, div);
        node.store.cookie('token', token);

        div.appendChild(document.createElement('br'));        
        div.appendChild(document.createElement('br'));

        link = document.createElement('a');
        link.href = gameLink;
        button = document.createElement('button');
        button.innerHTML = 'Proceed to the game';
        button.className = 'btn btn-lg btn-primary';
        link.appendChild(button);
        div.appendChild(link);
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
        
        node.connect("/requirements", function() {
            // Timeout is necessary because SERVER needs to send the player id
            setTimeout(function() {
                node.get('MTID', function(authorized) {
                    var msg;
                    if (authorized.success) {
                        gameLink = authorized.gameLink;
                        // No errors.
                        result([]);
                    }
                    else {
                        msg = 'Token authorization failed: ' + authorized.msg;
                        result([msg]);
                    }
                }, 'SERVER', token);
            });
        }, 500);
    }

    function nodeGameSetup() {
        var stager = new node.Stager();
        var game = {};
        var errors = [];

        game.metadata = {
            name: 'Requirements: nodeGameSetup',
            description: 'Tests node.setup.',
            version: '0.1'
        };

        try {
            stager.setOnInit(function() {
                console.log('Init test.');
                return true;
            });

            stager.addStage({
                id: 'requirements',
                cb: function() {
                    return true;
                },
                steprule: node.stepRules.WAIT
            });

            stager.init()
                .next('requirements');

            // Setting the property in game.

            game.plot = stager.getState();  

            // Configuring nodegame.
            node.setup('nodegame', {
	        // HOST needs to be specified only 
	        // if this file is located in another server
	        // host: http://myserver.com,	  
	        window: {
	            promptOnleave: false,
                    noEscape: true // Defaults TRUE
	        },
	        env: {
	            auto: false,
	        },
	        events: {
	            dumpEvents: false, // output to console all fired events
                    history: false // keep a record of all fired events
	        },
	        socket: {
	            type: 'SocketIo', // for remote connections
	            reconnect: false
	        },
                game_metadata: game.metadata,
                plot: game.plot,
                verbosity: 10
            });
        }
        catch(e) {
            errors.push(e);
        }

        return errors;            
    }

    // Skipped at the moment
    function connectivityTest(result) {
        var errors = [];

        try {
            node.connect("/requirements", function() {
                result(errors);
            });
        }
        catch(e) {
            errors.push(e);
            return errors;
        }
    }

    // Add all the requirements functions.
    req.addRequirements(
        // Tests nodeGame dependencies.
        req.nodeGameRequirements,
        cookieSupport,
        // loadFrameTest will temporarily change the main frame
        // reference. Trying to access DOM elements during the test
        // might cause errors.
        req.loadFrameTest,
        nodeGameSetup,
        checkToken
    );

    req.checkRequirements();

    node.log('Testing requirements.');
}

window.onload = function() {
    Requirements();
}