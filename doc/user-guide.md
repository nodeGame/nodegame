# nodeGame User Guide

- status: incomplete

## Disclaimer

nodeGame is under active development and new features are constantly added. We do our best to keep this documentation up to date, but it may happen that the software still behave slightly differently than what herein documented. We apologize for this, and kindly ask you to report any gap between this documentation and the actual software behavior.

## Who should read this

This guide covers the basic functionalities of the framework, and offers a broad picture of nodeGame to the beginner. For detailed documentation, API, and format specification please read the other files in the doc directory of the nodeGame repository.   

## Introduction

nodeGame is a free, open source, event-driven Javascript framework for on line, multiplayer games in the browser. It is specially designed to run social science experiments, for studying both individual choices and collective behavior. However, its architecture is general enough to run any type of game. 

### Targeted audience

nodeGame is designed to be as user-friendly as possible, but not more. This means that with little programming skills is already possible to create complex multiplayer games. On the other hand, minimal programming skills are indeed required. This obviously entails also some knowledge of Javascript, the programming language of the browser. For beginner guides about Javascript you can look into:

- [A beginner tutorial](http://www.w3schools.com/js/)
- [An advanced (not free) book](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742)

If you are familiar enough with Javascript you can proceed to the next section, and learn how to setup the nodeGame server, how clients can connect to it, and how to write games for nodeGame.

## Installation and Quick start

See [README](https://github.com/nodeGame/nodegame/blob/master/README.md) at the top of this root directory. 

## Understanding nodeGame

In order to run and conduct a game on nodeGame, you will need to:

  1. [setup the server](#setting-up-the-server)
  2. [create a game](#creating-a-game)
  3. [connect to the server](#connecting-to-the-server)
  4. [analyze the results](#analyzing-the-results)


### Setting up the server

In order to run the server you will need to write a small launcher file.

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

The `ServerNode` object accepts a configuration object as input parameter. Moreover, it is possible to write separate configuration files for different features of the server.
Detailed documentation available: [nodeGame server configuration guide](https://github.com/nodeGame/nodeGame/blob/master/doc/configure-nodegame-server.md).

### Creating a game

Create a new directory in one of the `games` folder, as defined in the configuration of your nodeGame server. This folder will contain all files necessary to run your game.

The structure of the game directory can vary depending on the game design. However, it will usually contain: 

  - [the client logic](#client-logic)
  - [the server logic](#server-logic)
  - [additional files](#additional-files) (e.g. images and HTML files)

Both server and client logic follow the same game structure.
#### Client logic

This is the file that is included in the HTML page

#### Server logic

This file is actually not necessary in single player games.

#### Additional files

At least one index file is
Files that should not be accessible, such as the server logic, can be placed in a directory named `server` inside the game directory. The content of this directory is private and will not be served by the HTTP server.

#### The game object

A game object defines a sequence of game _states_. Each state defines a set of local variables, the screens that will be shown, and the rules that will apply to user actions.
States can be repeated for a certain number of rounds, and divided in sub-states, called _steps_. It is possible to associate properties to each game state, however they may depend on the additional modules installed with nodeGame. Common extensions are the `timer`, or `done`.


| State       | State name   | Steps                | Repetitions | Properties  |
| ----------- | ------------ | -------------------- | ----------- | ----------- |
| **State A** | Instructions | Step 1               | x1 round    | timer       |
| **State B** | Game         | Step 1, Step2        | x10 rounds  | -           |
| **State C** | Debrief      | Step 1               | x1 round    | -           |

The above table is translated into the game object inside the game _loop_.

```javascript

  var game = {
    1: {
        name: 'Step1',
        state: function() {
          // some code here
        },
    },
    2: {
        name: 'Step2',
        state: function() {
          // some code here
        },
    }
  };
  
  this.loop = {

      1: {
        state: function() {
          // the code for the instruction goes here
        },
        name: 'Instructions',
        timer: 120000,
      },
      
      2: {
        state: game,
        name: 'Game',
        rounds: 10,
      },
      
      3: {
        state: function() {
          // the code goes here
        },
        name: 'Debrief'
      },
      
  }
```

Detailed documentation available: [nodeGame game structure](https://github.com/nodeGame/nodegame/blob/master/doc/game-structure.md). 

For complete, extensively commented examples see:

  - the [Ultimatum client](https://github.com/nodeGame/nodegame/blob/master/games/ultimatum/Ultimatum.js) file in the `games` folder.
  - the [Ultimatum logic](https://github.com/nodeGame/nodegame/blob/master/games/ultimatum/server/logic.js) file in the `games/server` folder.

### Connecting to the server

Now that the server is running, and that a new game folder was created, we need to point our browsers to the our game page, usually called `index.html`.

```html
    <!doctype html>
    <title>nodeClient Example</title>
    <body>
    <script src="/socket.io/socket.io.js"></script> 
    <script src="/javascript/nodegame-full.js" charset="utf-8"></script>
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

The above example shows a piece of HTML code containing four Javascript scripts. In this script 


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


#### What happens during a game ?

nodeGame is a messaging library. Clients exchange messages, and react accordingly. All messages pass through the server, which routes them to the correct receiver. When a message is received a particular event is created.

nodeGame provides a convenient API (application programming interface) to deal with most of the standard use cases and events. 

##### What are events?

An event is literally something that has happened. It can really be anything, e.g. the user moving the mouse over a given area of the screen, or clicking a button. Javascript is shipped already with an exhaustive list of event handlers, nodeGame adds some extra ones more targeted for a gaming environment. 



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
