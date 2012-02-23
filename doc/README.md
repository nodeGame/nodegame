# nodeGame Documentation

~~~
Disclaimer to this documentation

nodeGame is under active development and new features are constantly added. We do our best to keep this documentation up to date, but it may happen that the software still behave slightly differently than what herein documented. We apologize for this, and kindly ask you to report any gap between this documentation and the actual software behavior.
~~~

## Introduction

**nodeGame** is a free, open source, event-driven javascript framework for multiplayer online games in a browser environment.

### Features

- Synchronous and Asynchronous games 
- Keep track of the state of the players
- Start/Pause/Resume games
- Reliable Messaging
- Anti flood protection (to do)
- SSL connection (to check)
- Statistics 
- Output Formatting
- Mailing
- Easy to customize. [See the examples section.](#examples)
- much more... 


## Technology

**nodeGame** is 100% javascript code. It is built upon [node.js](http://nodejs.org) and  [socket.io](http://socket.io) and it is designed to integrate seeminglessly with other libraries. 

## Targeted audience

**nodeGame** is designed to be as user-friendly as possible, but not more. This means that with little programming skills is already possible to create complex multiplayer games. On the other hand, minimal programming skills are indeed required. This obviously entails also some knowledge of javascript, the programming language of the browser. For starting guides about javascript you can look into:

- [A beginner tutorial](http://www.w3schools.com/js/)
- [An advanced (not free) book](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742)

If you are familiar enough with javascript you can proceeds to the next section, showing how to setup a nodeGame server, and clients, and how to write games for nodeGame.

## Examples ## {#examples}


### How to run the server

- You need to have [node.js](http://nodejs.org) installed in your system.

- Get the latest nodeGame module from [github](https://github.com/shakty/nodeGame/).

- Copy the server directory in a folder of your choice.

- Create a launcher file in the same directory, or use the predefined one **server.js**.

- A minimal launcher configuration file would look like <<server-launcher-example, the launcher in the example>>


#### nodeServer launcher file

    var ServerNode = require('./nodegame-server');

    var options = { 
		name: "nodeGame Server",
		port: 8080
    };

    var sn = new ServerNode(options);

    sn.addChannel({
		name: 'Ultimatum Game',
		player: 'ultimatum/'         // End point for users 
		admin: 'ultimatum/admin/',   // End point for administrator
    });


The above snippet of code can be easily explained:

- the **require** directive import the nodegame-server module;
- a **ServerNode** object with a given name is created listening on port 8004  
- a _channel_ is added to the server; a channel is just specific address which can be bound to a specific game.

Save the above file as **server.js**, and run the server with command: 

    node server.js

If you want to make sure that your server stays always up you can read this great tutorial:

- http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever

### How to write a client

The server architecture is very flexible, and a client can be written mostly in any programming language able to implement web sockets. However, the +*nodeGame*+ client library is for now available in javascript only, therefore the only two enviroment where it can be run are the browser, and Node.js. Herein, two examples follows.

#### nodeGame client in a browser

    <!doctype html>
    <title>nodeClient Example</title>
    <body>
    <script src="http://localhost:8080/socket.io/socket.io.js"></script> 
    <script src="http://localhost:8080/nodegame.js" charset="utf-8"></script>
    <script src="Ultimatum.js" charset="utf-8"></script>

    <script>
      window.onload = function(){
        var conf = {
          name: 'Player_1',
          url: 'http://localhost:8080/ultimatum/'
        };
        node.play(conf, new Ultimatum());
      }
   </script>
   </body>


#### nodeGame client in Node.js

    var GameExample = require(ultimatum'); // path/to/ultimatum
    var nodegame = require('nodegame-client'); //path/to/nodegame-client

    var conf = {
      name: 'Player_1',
      url: 'http://localhost:8080/ultimatum/'
    };
    nodegame.play(conf, new Ultimatum());


As you could see, both files are rather similar, and the main difference concerns how to import the nodeGame library. Notice that the actual game to play must be instantiated and passed as a parameter to the **play** method.


### How to write a game

Section still under construction...

A game consist in a set of states, steps and rounds. For each step it is possible to define different screens, and rules to apply to the user actions. 


| State       | State name   | Steps                | Repetitions |
| ----------- | ------------ | -------------------- | ----------- |
| **State A** | Instructions | Step 1		        | x1 round    |
| **State B** | Game)	     | Step 1, Step2, Step3	| x10 rounds  |
| **State C** | Debrief	     | Step 1  	 	        | x1 round    |

It is possible to associate other properties to each game state, however they may depends on the additianal modules installed with nodeGame. Common extensions are the **timer**, or **done** properties, explained later.

#### Game Messages

Games are played exchanging messages between players. All messages pass through the server, which routes them to the correct receiver. Whenever a message is received an event is raised informing that such a event has just event. Writing a game reduces to emitting and catching the events you are interested in.

##### What are events?

An event is literally something that has happened. It can really be anything, e.g. the user moving the mouse over a given area of the screen, or clicking a button. Javascript is shipped already with an exhaustive list of event handlers, **nodeGame** adds some extra ones more targeted for a gaming environment. 


##### How to emit and catch events?


After importing the **nodeGame-client** library, the **node** object is available in your programming environment. 


| node.emit('EVENT', p1, p2, p3) | Generic hook for emitting an event locally.                                 |
| node.set('EVENT', p1, p2, p3)  | A specific piece of information is send out to the players or to the server |
| node.say('EVENT', p1, p2, p3)  | An generic piece of information is send out to the players or to the server |
| node.get('EVENT', callback)    | Request something to the server, and then executes the callback.            |
| node.show()                    | Automatically pops up an HTML node in the player's screnn. **Not yet implemented** |
| node.on('EVENT', function)	 | Execute function whenever 'EVENT' is triggered                              |


It is important to understand that the **emit** method ...TODO.


Each message belongs to a certain category, which can specified by the users. Some categories are already prepared and have special meaning.


| Type   | Meaning |
| ------ | --------------------------------------------------- |
| HI	 | Establish the connection between server and clients |
| STATE  | Communicate or set the state of the game |
| PLIST  | Communicate or set the list of players |
| DATA	 | Pass over some data |
| TXT	 | Pass over a text message |
| DONE   | Communicate that a player has terminated a stage of the game |
| BYE	 | Terminate the connection between server and client (TO BE DONE) |

All the message, with the sole exceptions of HI and BYE messages, also have the following properties:


Direction Outgoing or Incoming 

| Target 	| Meaning      | 
| --------- | ------------ |
| SAY       | ... |
| SET       | ... |
| GET       | ... |

## nodeGame TODO


There is still a long list of things which are planned for future development.

1. Distribute nodeGame as a standard package on npm
2. Create a custom nodeGame package manager for games and widgets only (ngpm)
3. Games can directly passed as an object in the server
4. Implementing a vast amount of games from the literature.
5. Facilitating the exporting of results
6. Storing the state of the game locally to resume upon reconnection.


## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
