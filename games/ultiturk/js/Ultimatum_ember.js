function Ultimatum(){
    this.name = 'Ultimatum Game';
    this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
    this.version = '0.3';

    // Wait for a STATE message from the server
    // to go to next state
    this.auto_step = false; 
    this.auto_wait = true;
    
    this.minPlayers = 2;
    this.maxPlayers = 10;
    
    this.BIDDER = 1;
    this.RESPONDENT = 0;

    var node;
    
    // Initialize the Views and create the Bindings.
    this.init = function(){

        window.Game = Ember.Application.create();
        
        // Create the bindings.
        Game.player = Ember.Object.create({
            name: 'Empty Player Name',
            id: 'Empty Player ID',
            state: 'Empty Player State'
        });

        Game.state = Ember.Object.create({
            previous: '-',
            current: '-',
            next: '-'
        });
        
        Game.timer = Ember.Object.create({
            time: '0:0'
        });


        // Create the view for VisualState.
        var visualState = Ember.View.create({
            templateName: 'VisualState'
        });
        visualState.appendTo('#root');
        

        // Create the view for VisualTimer.
        var visualTimer = Ember.View.create({
            templateName: 'VisualTimer'
        });
        visualTimer.appendTo('#root');


        // Create the view for the DoneButton.
        var doneButton = Ember.View.create({
            templateName: 'DoneButton'
        });
        doneButton.appendTo('#root');
        

        // Create the view for the StateDisplay.
        var stateDisplay = Ember.View.create({
            templateName: 'StateDisplay'
        });
        stateDisplay.appendTo('#root');


        // capture node
        setTimeout(function(){
            node = window.node;
        }, 2000);

        // Update VisualState bindings.
        setTimeout(function(){
            var miss = '-';
            Game.state.set('previous', window.node.game.gameLoop.getName(window.node.game.gameState) || miss);
            Game.state.set('current', window.node.game.gameLoop.getName(window.node.game.previous()) || miss);
            Game.state.set('next', window.node.game.gameLoop.getName(window.node.game.next()) || miss);
        }, 4000);

        // Update VisualTimer bindings.
        // setTimeout(function(){
            
        // }, 4000);

        // Update StateDisplay bindings.
        setTimeout(function(){
            Game.player.set('name', window.node.game.player.name);
            Game.player.set('id', window.node.game.player.id);
            Game.player.set('state', new GameState(window.node.game.gameState).toString());
        }, 4000);
        
        
        //// SOCKET.IO -------------
        // var chat = io.connect('http://localhost/chat')
        //     , news = io.connect('http://localhost/news');
        // 
        //   chat.on('connect', function () {
        //     chat.emit('hi!');
        //   });
        // 
        //   news.on('news', function () {
        //     news.emit('woot');
        //   });
        
        // node.window.setup('PLAYER');
        


        
        //         this.header  = this.generateHeader();
        //      var mainframe   = this.addIFrame(this.root,'mainframe');
        //      
        // node.game.vs     = this.addWidget('VisualState', this.header);
        // node.game.timer = this.addWidget('VisualTimer', this.header);
        // node.game.doneb = this.addWidget('DoneButton', this.header);
        // node.game.sd     = this.addWidget('StateDisplay', this.header);
        // 
        // this.addWidget('WaitScreen');
        //      
        // // Add default CSS
        // if (node.conf.host) {
        //  this.addCSS(document.body, node.conf.host + '/player.css');
        // }
 
    };

    var pregame = function(){

    };

    var instructions = function(){

    };

    var ultimatum = function(){

    };

    var postgame = function(){

    };

    var endgame = function(){

    };

    // Creating the game loop 
    this.loops = {
        1: {state: pregame,
            name: 'Game will start soon'
        },
        2: {state: instructions,
            name: 'Instructions'
        },     
        3: {rounds: 10, 
            state:  ultimatum,
            name: 'Ultimatum Game'
        }, 
        4: {state: postgame,
            name: 'Questionnaire'
        },
        5: {state: endgame,
            name: 'Thank you!'
        }
    }; 
    
};

// function Ultimatum () {
//  
//  this.name = 'Ultimatum Game';
//  this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
//  this.version = '0.3';
//  
//  // Wait for a STATE message from the server
//  // to go to next state
//  this.auto_step = false; 
//  this.auto_wait = true;
//  
//  
//  this.minPlayers = 2;
//  this.maxPlayers = 10;
//  
//  this.BIDDER = 1;
//  this.RESPONDENT = 0;
//  
//  this.init = function() {    
//      node.window.setup('PLAYER');
//  };
//  
//  
//  var pregame = function() {
//      node.window.loadFrame('pregame.html');
//      node.DONE();
//      console.log('Pregame');
//  };
//  
//  var instructions = function(){  
//      var that = this;
//      
//      node.window.loadFrame('instructions.html', function() {
//          var b = node.window.getElementById('read');
//          b.onclick = function() {
//              node.DONE();
//          };
//          
//          // Autoplay
//          node.DONE();
//      });
//      console.log('Instructions');
//  };
//      
//  var ultimatum = function () {
//      
//      var that = this;        
//      node.window.loadFrame('solo.html', function () {
//          
//          
//          node.onDATA('BIDDER', function (msg) {
//              
//              that.other = msg.data.other;
//              console.log('OTHER ' + msg.data.other);
//              
//              node.set('ROLE', 'BIDDER');
//              node.window.loadFrame('bidder.html', function () {
// 
//                  var root = node.window.getElementById('root');
//                  var b = node.window.getElementById('submitOffer');
//                  
//                  b.onclick = function() {
//                      var offer = node.window.getElementById('offer');
//                      // Store the value in memory
//                      node.set('offer', offer.value);
//                      node.say(offer.value, 'OFFER', that.other);
//                      node.window.write(' Your offer: ' +  offer.value);
//                  };
//                  
//                  node.onDATA('ACCEPT', function (msg) {
//                          node.window.write('Your offer was accepted');
//                          node.DONE();
//                  });
//                      
//                  node.onDATA('REJECT', function (msg) {
//                      node.window.write('Your offer was rejected');
//                      node.DONE();
//                  });
//              });
//          });
//              
//          node.onDATA('RESPONDENT', function (msg) {
//              that.other = msg.data.other;
//              node.set('ROLE', 'RESPONDENT');
//              node.window.loadFrame('resp.html', function () {
//                  
//                  node.onDATA('OFFER', function (msg) {           
//                      var offered = node.window.getElementById('offered');
//                      node.window.write('You received an offer of ' + msg.data, offered);
//                      offered.style.display = '';
//                  
//                      var accept = node.window.getElementById('accept');
//                      var reject = node.window.getElementById('reject');
//                      
//                      accept.onclick = function() {
//                          node.set('response','ACCEPT');
//                          node.say('ACCEPT', 'ACCEPT', that.other);
//                          node.DONE();
//                      };
//                      
//                      reject.onclick = function() {
//                          node.set('response','REJECT');
//                          node.say('REJECT', 'REJECT', that.other);
//                          node.DONE();
//                      };
//                  });
//          });
//          
//          node.onDATA('SOLO', function() {
//              console.log('solodone');
//              node.DONE();
//          });
//              
//      });
//  
//          console.log('Ultimatum');
//      });
//  };
//  
//  var postgame = function(){
//      node.window.loadFrame('postgame.html', function(){
//          node.random.emit('DONE');
//      });
//      console.log('Postgame');
//  };
//  
//  var endgame = function(){
//      node.window.loadFrame('ended.html');
//      console.log('Game ended');
//  };
//  
//  // Creating the game loop
//  
//  this.loops = {
//      1: {state: pregame,
//          name: 'Game will start soon'
//      },
//      
//      2: {state: instructions,
//          name: 'Instructions'
//      },
//      
//      3: {rounds: 10, 
//          state:  ultimatum,
//          name: 'Ultimatum Game'
//      }, 
//      
//      4: {state: postgame,
//          name: 'Questionnaire'
//      },
//      
//      5: {state: endgame,
//          name: 'Thank you!'
//      }
//  };  
// };
