# nodeGame User Guide

- last update: 16/10/2012 
- status: incomplete

## Disclaimer

nodeGame is under active development and new features are constantly added. We do our best to keep this documentation up to date, but it may happen that the software still behave slightly differently than what herein documented. We apologize for this, and kindly ask you to report any gap between this documentation and the actual software behavior.

## Who should read this

This guide covers the basic functionalities of the framework, and offers a broad picture of nodeGame to the beginner. For detailed documentation, API, and format specification please read the other files in the doc directory of this repository.   

## Introduction

nodeGame is a free, open source, event-driven Javascript framework for on line, multiplayer games in the browser. It is specially designed to run social science experiments, for studying both individual choices and collective behavior. However, its architecture is general enough to run any type of game. 

### Targeted audience

nodeGame is designed to be as user-friendly as possible, but not more. This means that with little programming skills is already possible to create complex multiplayer games. On the other hand, minimal programming skills are indeed required. This obviously entails also some knowledge of Javascript, the programming language of the browser. For beginner guides about Javascript you can look into:

- [A beginner tutorial](http://www.w3schools.com/js/)
- [An advanced (not free) book](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742)

If you are familiar enough with Javascript you can proceed to the next section, and learn how to setup the nodeGame server, how clients can connect to it, and how to write games for nodeGame.

## Installation and Quick start

See [README](https://github.com/nodeGame/nodegame/blob/master/README.md) at the top of this root directory. 

## Understanding 

In order to run and conduct a game on nodeGame, it is necessary to know the essential components of the framework:

  1. launcher file(#launcher)
  2. client logic
  3. server logic
  4. various configuration files



### nodeServer launcher file {#launcher}

The launcher file starts the nodeGame server.

```js
    var ServerNode = require('nodegame-server').ServerNode;
    
    // Options can be specified as input parameter
    var sn = new ServerNode();
    
    sn.addChannel({
        name: 'Ultimatum',
        admin: 'ultimatum/admin',
        player: 'ultimatum',
        game: 'ultimatum',          
    });
```

In the above example:

- the `require` directive import the nodegame-server module;
- a `ServerNode` object with a given name is created listening on port 8080 (by default) 
- a _channel_ is added to the server; a channel binds a route to a specific game. It contains two end-points: for users and administrators.

The `ServerNode` object accepts a configuration object as input parameter. For detailed documentation on nodeGame server configuration read [this guide](https://github.com/nodeGame/nodeGame/blob/master/doc/configure-nodegame-server.md)

### client logic {#client-logic}

Now that the server is running, we need to point our browsers to the  

```html
    <!doctype html>
    <title>nodeClient Example</title>
    <body>
    <script src="/socket.io/socket.io.js"></script> 
    <script src="/javascript/nodegame.js" charset="utf-8"></script>
    <script src="Ultimatum.js" charset="utf-8"></script>
    <script>
      window.onload = function(){
        var conf = {
          player: {
            name: 'Player_1',
          }
          url: '/ultimatum'
        };
        node.play(conf, new Ultimatum());
      }
   </script>
   </body>
```

The above example shows a piece of HTML code containing three Javascript scripts. In this script 


Clients do not necessarily need to connect with the browser, or to be human. An automaton bot-player could be launched in the following way.

```js
    var UltiBot = require('ultimatum-bot'); // path/to/ultimatum-bot
    var node = require('nodegame-client'); 

    var conf = {
      player: {
        name: 'Player_Bot',
      },
      url: 'http://localhost:8080/ultimatum/'
    };
    node.play(conf, new UltiBot());
```

As you could see, both files are rather similar, and the main difference concerns how to import the nodeGame library. Notice that the actual game to play must be instantiated and passed as a parameter to the `play` method.


### server logic {#server-logic}

The automaton bot client already showed how to connect 

```js
    var UltiBot = require('ultimatum-bot'); // path/to/ultimatum-bot
    var node = require('nodegame-client'); 

    var conf = {
      player: {
        name: 'Player_Bot',
      },
      url: 'http://localhost:8080/ultimatum/'
    };
    node.play(conf, new UltiBot());
```


### The game structure

**Section still under construction...**

This is just a brief introduction for a complete guide refer to the specific guide.


A game consist in a set of states, steps and rounds. For each step it is possible to define different screens, and rules to apply to the user actions. 


| State       | State name   | Steps                | Repetitions |
| ----------- | ------------ | -------------------- | ----------- |
| **State A** | Instructions | Step 1		            | x1 round    |
| **State B** | Game  	     | Step 1, Step2, Step3	| x10 rounds  |
| **State C** | Debrief	     | Step 1  	 	          | x1 round    |

It is possible to associate other properties to each game state, however they may depend on the additional modules installed with nodeGame. Common extensions are the `timer`, or `done` properties.

#### What happens during a game ?

nodeGame is a messaging library. Clients exchange messages, and react accordingly. All messages pass through the server, which routes them to the correct receiver. When a message is received a particular event is created.

nodeGame provides a convenient API (application programming interface) to deal with most of the standard use cases and events. 

##### What are events?

An event is literally something that has happened. It can really be anything, e.g. the user moving the mouse over a given area of the screen, or clicking a button. Javascript is shipped already with an exhaustive list of event handlers, nodeGame adds some extra ones more targeted for a gaming environment. 

##### Game Messages

Whenever a message is received an event is raised informing that such a event has just occurred. Writing a game consists simply in emitting and catching the events you are interested in.


###### Message categories (targets)

Each message which is sent belongs to a certain category, which can specified by the users. Some categories are already prepared and have special meaning.

| Type   | Meaning |
| ------ | --------------------------------------------------- |
| HI	   | Establish the connection between server and clients |
| STATE  | Communicate or set the state of the game |
| PLIST  | Communicate or set the list of players |
| DATA	 | Pass over some data |
| TXT	   | Pass over a text message |
| DONE   | Communicate that a player has terminated a stage of the game |
| REDIRECT | Redirect a client to a new address (available only for administrator) |
| BYE	   | Terminate the connection between server and client **Not yet implemented** |

##### Message actions

Each message category can belong to one of the following actions:

| Type   | Meaning |
| ------ | --------------------------------------------------- |
| SAY    | Send a piece of information to a remote receiver    |
| SET    | Set the value of a variable of a remote object      |
| GET    | Request a remote object                          |

##### A final example on game messages

Finally, messages can be _incoming_ or _outgoing_, therefore a typically event listener is of the form

```javascript
  
  node.emit('out.say.DATA', myData);

  node.on('in.say.DATA', function(msg) {
    // do something
  });
``` 
Predefined event listeners are already defined. See the `nodegame-client` documentation for help. 

## Brief API summary

By loading the _nodegame-client_ library you get access to the `node` 

### Connect to a server

| **Method**                     | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.connect(conf, game)       | Connects to the url specified in configuration object and start the game object|
| node.play(conf, game)          | _Deprecated_ The same as node.connect |


### Emitting and catching events

| **Method**                     | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.emit('KEY')               | Generic hook for emitting an event locally.                                 |
| node.set('KEY', value)         | Saves a key value pair to the server memory object                          |
| node.say(value, 'KEY', player) | An generic piece of information is send out to the players or to the server |
| node.get('KEY', callback)      | Request something to the server, and then executes the callback.            |
| node.on('KEY', callback)       | Execute function whenever an event 'KEY' is triggered                       |


Important! The `emit` method by itself does **NOT** send data to other players or the server. However, emitting particular types of events locally triggers other hooks which in turn send the data out. 


### Objects 



| **Objects**                    | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.game                      | The game currently loaded                                                   |
| node.game.memory               | The local database (see below for more details)                             |
| node.game.pl                   | The player list object of clients connected|
| node.msg                       | The msg generator object. Can create custom game messages |
| node.socket                    | The connection socket with the server |
| node.player                    | The player data for the client |

### nodegame-window and nodegame-widgets


| **Objects**                    | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.window                    | An helper object to interact with the browser window    |
| node.window.widgets            | A collection of reusable functions to             |

### Memory api


| **Memory api**                 | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| memory.sort('payoff')          | Sort all entries by a property called _'payoff'_                            |
| memory.select('state', '>', '2.1')| Select only entries inserted after game state _'2.1'_ |
| memory.select('state', '=', this.previous()).join('player', 'player', 'CF', 'value') | Advanced operation |


The memory object is a special instance of the _NDDB_ database. 
For more information about the _node.game.memory_ API see the [NDDB home page](http://nodegame.github.com/NDDB/).

### JSUS

`node.JSUS` contains a collection of helper functions for diverse purpose, from randomization and sorting, to creation of a latin square. 
See the [JSUS home page](http://nodegame.github.com/JSUS/) for the full API.


## Further reading

This little guide is far from being complete. It may also be not updated. 
You can find additional information in the other files present in doc directory of this repository. 


## Technology

nodeGame is 100% Javascript code. 

### Server

It order to run the server you need to have [node.js](http://nodejs.org) installed on your machine.

### Client

High performances communication is guaranteed by [socket.io](http://socket.io), the cross-browser WebSocket for realtime apps. Moreover, nodeGame integrates seeminglessly with other libraries, such as:

  * [D3](http://d3js.org/)
  * [jQuery](http://jquery.com/)

Two additional packages - already shipped with the default installation of nodegame - extend the capabilities of _nodegame-client_:

  * [nodegame-window](https://github.com/nodeGame/nodegame-window) 
  * [nodegame-widgets](https://github.com/nodeGame/nodegame-widgets)



## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
