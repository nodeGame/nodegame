# nodeGame: game structure

- status: incomplete

## Brief API summary

By loading the _nodegame-client_ library you get access to the `node` object.

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
| node.events                    | The event emitter object. Registers a executes function listeners |
| node.socket                    | The connection socket with the server |
| node.player                    | The player data for the client |

### nodegame-window and nodegame-widgets


| **Objects**                    | **Meaning** |
| ------------------------------ | ----------------------------------------------------------------------------|
| node.window                    | An helper object to interact with the browser window    |
| node.window.widgets            | A collection of reusable functions to             |

### Memory api

node.game.memory

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
    
## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
