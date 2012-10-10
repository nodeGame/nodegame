# nodeGame Documentation

- version 5.0.0
- status: incomplete

## Disclaimer to this documentation

nodeGame is under active development and new features are constantly added. We do our best to keep this documentation up to date, but it may happen that the software still behave slightly differently than what herein documented. We apologize for this, and kindly ask you to report any gap between this documentation and the actual software behavior.


## Introduction

nodeGame is a free, open source, event-driven Javascript framework for on line, multiplayer games in the browser.

### Features

- Synchronous and asynchronous games 
- Keep track of the state of the players
- Start/Pause/Resume games
- Reliable Messaging
- Statistics 
- Output Formatting
- Mailing
- Easy to customize
- much more... 


## Technology

nodeGame is 100% Javascript code. 

### Server

It order to run the server you need to have [node.js](http://nodejs.org) installed on your machine.

### Client

The client makes use [socket.io](http://socket.io) and it is designed to integrate seeminglessly with other libraries, such as:

  * [D3](http://d3js.org/)
  * [jQuery](http://jquery.com/)

Two additional packages - already shipped with the default installation of nodegame - extend the capabilities of _nodegame-client_:

  * [nodegame-window](https://github.com/nodeGame/nodegame-window) 
  * [nodegame-widgets](https://github.com/nodeGame/nodegame-widgets)


## Targeted audience

nodeGame is designed to be as user-friendly as possible, but not more. This means that with little programming skills is already possible to create complex multiplayer games. On the other hand, minimal programming skills are indeed required. This obviously entails also some knowledge of Javascript, the programming language of the browser. For beginner guides about Javascript you can look into:

- [A beginner tutorial](http://www.w3schools.com/js/)
- [An advanced (not free) book](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742)

If you are familiar enough with Javascript you can proceed to the next section, and learn how to setup the nodeGame server, how clients can connect to it, and how to write games for nodeGame.

## Examples


### How to run the server

- Remember, you need to have [node.js](http://nodejs.org) installed in your system.

- Get the latest nodeGame module from [github](https://github.com/nodeGame/nodegame).

- Copy the server directory in a folder of your choice.

- Create a launcher file in the same directory, or use the default server.js`.

- A minimal launcher configuration file would look like the following example:


#### nodeServer launcher file
```js
    var ServerNode = require('./nodegame-server').ServerNode;
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
```

The above snippet of code can be easily explained:

- the `require` directive import the nodegame-server module;
- a `ServerNode` object with a given name is created listening on port 8080  
- a _channel_ is added to the server; a channel binds a route to a specific game. It contains two end-points: for users and administrators.

Save the above file as `server.js`, and run the server with command: 

    node server.js

If you want to make sure that your server stays always up you can read this great tutorial:

- http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever

### How to write a client

The server architecture is very flexible, and a client can be written mostly in any programming language able to implement web sockets. However, the nodeGame client library is for now available in Javascript only, therefore the only two enviroment where it can be run are the browser, and Node.js. Herein, two examples follows.

#### nodeGame client in a browser

```js
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
          url: '/ultimatum'
        };
        node.play(conf, new Ultimatum());
      }
   </script>
   </body>
```

#### nodeGame client in Node.js

```js
    var GameExample = require(ultimatum'); // path/to/ultimatum
    var nodegame = require('nodegame-client'); 

    var conf = {
      name: 'Player_1',
      url: 'http://localhost:8080/ultimatum/'
    };
    nodegame.play(conf, new Ultimatum());
```

As you could see, both files are rather similar, and the main difference concerns how to import the nodeGame library. Notice that the actual game to play must be instantiated and passed as a parameter to the `play` method.


### How to write a game

Section still under construction...

A game consist in a set of states, steps and rounds. For each step it is possible to define different screens, and rules to apply to the user actions. 


| State       | State name   | Steps                | Repetitions |
| ----------- | ------------ | -------------------- | ----------- |
| **State A** | Instructions | Step 1		        | x1 round    |
| **State B** | Game)	     | Step 1, Step2, Step3	| x10 rounds  |
| **State C** | Debrief	     | Step 1  	 	        | x1 round    |

It is possible to associate other properties to each game state, however they may depend on the additianal modules installed with nodeGame. Common extensions are the `timer`, or `done` properties, explained later.

#### Game Messages

Games are played exchanging messages between players. All messages pass through the server, which routes them to the correct receiver. Whenever a message is received an event is raised informing that such a event has just event. Writing a game consists simply in emitting and catching the events you are interested in.

##### What are events?

An event is literally something that has happened. It can really be anything, e.g. the user moving the mouse over a given area of the screen, or clicking a button. Javascript is shipped already with an exhaustive list of event handlers, nodeGame adds some extra ones more targeted for a gaming environment. 


##### How to emit and catch events?


After importing the `nodeGame-client` library, the `node` object is available in your programming environment, with the following built-in methods.


| **Method**                     | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.emit('EVENT', p1, p2, p3) | Generic hook for emitting an event locally.                                 |
| node.set('EVENT', p1, p2, p3)  | A specific piece of information is send out to the players or to the server |
| node.say('EVENT', p1, p2, p3)  | An generic piece of information is send out to the players or to the server |
| node.get('EVENT', callback)    | Request something to the server, and then executes the callback.            |
| node.on('EVENT', function)	   | Execute function whenever 'EVENT' is triggered                              |


It is important to understand that the `emit` method by itself does **NOT** send data to other players or the server. However, emitting particular types of events locally triggers other hooks which in turn send the data out. 


Each message which is sent belongs to a certain category, which can specified by the users. Some categories are already prepared and have special meaning.


| Type   | Meaning |
| ------ | --------------------------------------------------- |
| HI	 | Establish the connection between server and clients |
| STATE  | Communicate or set the state of the game |
| PLIST  | Communicate or set the list of players |
| DATA	 | Pass over some data |
| TXT	 | Pass over a text message |
| DONE   | Communicate that a player has terminated a stage of the game |
| BYE	 | Terminate the connection between server and client **Not yet implemented** |


## Brief API summary

| **Method**                     | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.emit('KEY')               | Generic hook for emitting an event locally.                                 |
| node.set('KEY', value)         | Saves a key value pair to the server memory object                          |
| node.say(value, 'KEY', player) | An generic piece of information is send out to the players or to the server |
| node.get('KEY', callback)      | Request something to the server, and then executes the callback.            |
| node.on('KEY', callback)       | Execute function whenever an event 'KEY' is triggered                       |

| **Objects**                    | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.game.memory               | The local database                                                          |
| node.game.pl                   | The player list |
| node.window                    | An object    |
| node.window.widgets            | Request something to the server, and then executes the callback.            |



| **Memory api**                 | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| memory.sort('payoff')          | Sort all entries by a property called _'payoff'_                            |
| memory.select('state', '>', '2.1')| Select only entries inserted after game state _'2.1'_ |
| memory.select('state', '=', this.previous()).join('player', 'player', 'CF', 'value') | Advanced operation |

For more information about the _node.game.memory_ API see the [NDDB home page](http://nodegame.github.com/NDDB/).


## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
