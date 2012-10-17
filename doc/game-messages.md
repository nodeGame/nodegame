# nodeGame: game structure

- status: incomplete

## Game structure

##### Game Messages

Whenever a message is received an event is raised informing that such a event has just occurred. Writing a game consists simply in emitting and catching the events you are interested in.


###### Message categories (targets)

Each message which is sent belongs to a certain category, which can specified by the users. Some categories are already prepared and have special meaning.

| Type   | Meaning |
| ------ | --------------------------------------------------- |
| HI     | Establish the connection between server and clients |
| STATE  | Communicate or set the state of the game |
| PLIST  | Communicate or set the list of players |
| DATA   | Pass over some data |
| TXT    | Pass over a text message |
| DONE   | Communicate that a player has terminated a stage of the game |
| REDIRECT | Redirect a client to a new address (available only for administrator) |
| BYE    | Terminate the connection between server and client **Not yet implemented** |

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
  
    
## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
