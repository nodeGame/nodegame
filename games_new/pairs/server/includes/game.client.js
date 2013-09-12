/**
 * This file contains all the building blocks (functions, and configuration)
 * that will be sent to each connecting player.
 */

var ngc = module.parent.exports.ngc;
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

var stager = new Stager();
var game = {};

module.exports = game;

// GLOBALS

game.globals = {};

// INIT and GAMEOVER

stager.setOnInit(function() {
    console.log('INIT PLAYER!');
    W.setup('PLAYER');

    var that = this;
    node.on.data('pairs', function(msg) {
        var leftSrc, rightSrc, data, imgLeft, imgRight;
        data = msg.data;
        leftSrc = msg.data.left;
        rightSrc = msg.data.right;
        imgLeft = document.createElement('img');
        imgLeft.src = leftSrc;
        imgLeft.className = 'face';
        W.getElementById('td_face_left').appendChild(imgLeft);
        imgRight = document.createElement('img');
        imgRight.src = rightSrc;
        imgRight.className = 'face';
        W.getElementById('td_face_right').appendChild(imgRight);
        console.log('created and updated pictures');
    });

});

///// STAGES and STEPS

var REPEAT = 3;

var pairs = function() {
    console.log('pairs');
    W.loadFrame('/pairs/html/pairpage.htm', function() {
        var send, next;
        var input, chat;

        input = W.getElementById('msgbox');
        send = W.getElementById('sendButton');
        next = W.getElementById('doneButton');
        chat = W.getElementById('chat');

        send.onclick = function() {
            // Send message to others in room:
            node.socket.send(node.msg.create({
                to: 'ALL',
                text: 'message',
                data: input.value
            }));

            // Send message to ourselves for feedback:
            node.socket.send(node.msg.create({
                to: node.player.id,
                text: 'message',
                data: input.value
            }));

            input.value = '';
        };

        next.disabled = "";

        next.onclick = function() {
            this.disabled = "disabled";
            node.emit('DONE');
        };

        node.on('in.say.DATA', function(msg) {
            if (msg.text === 'message') {
                chat.innerHTML = chat.innerHTML + msg.from + ': <strong>' +
                                 msg.data + '</strong><br>';
            }
        });

        node.env('auto', function() {
            input.value = '' + Math.random();
            send.click();
            node.randomExec(function() {
                next.click();
                node.set('EXIT', {
                    foo: Math.random()
                });
            });
        });
    });

    return true;
};



stager.addStage({
    id: 'instructions',
    cb: function() {
        console.log('instructions');
        W.loadFrame('/pairs/html/instructions.htm', function() {
            var next;
            next = W.getElementById("doneButton");
            next.onclick = function() {
                this.disabled = "disabled";
                node.emit('DONE');
            };

            node.env('auto', function() {
                node.randomExec(function() { next.click(); });
            });
        });
        
        return true;
    },
    steprule: stepRules.SYNC_STAGE
});


stager.addStage({
    id: 'pairs',
    cb: pairs,
    steprule: stepRules.SYNC_STEP
});

// Now that all the stages have been added,
// we can build the game plot

stager.init()
    .next('instructions')
    .repeat('pairs', REPEAT)
    .gameover();

stager.setOnGameOver(function() {
    W.loadFrame('/pairs/html/gameover.htm', function() {
        console.log('Game over');
    });
});

// We serialize the game sequence before sending it
game.plot = stager.getState();

// Let's add the metadata information

game.metadata = {
    name: 'pairs',
    version: '0.0.2',
    session: 1,
    description: 'no descr'
};


// Other settings, optional

game.settings = {
    publishLevel: 2
};

game.env = {
    auto: true
};