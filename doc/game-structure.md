# nodeGame: game structure

- status: incomplete

## Game Structure

This guide will explain you how to write a nodeGame game.

Every game is the input parameter [node.Game](https://github.com/nodeGame/nodegame/blob/master/games/ultimatum/Ultimatum.js)
    
## Game properties

### Properties

 - `observer`: If TRUE, silently observes the game. Defaults FALSE

An nodeGame observer will not send any automatic notification to the server, but it will just observe the game played by other clients.
  

 - `auto_step` If TRUE, automatically advances to the next state when DONE

After a successful DONE event is fired, the client will automatically goes to the next function in the game-loop without waiting for a STATE message from the server.
Depending on the configuration settings, it can still perform additional checkings (e.g. wheter the mininum number of players is connected) before stepping to the next state.
  

 - `auto_wait`: If TRUE, fires a WAITING... event immediately after a successful DONE event

Under default settings, the WAITING... event temporarily prevents the user to access the screen and displays a message to the player
 
 
### Functions

 - `init`: Initialization function
  
This function is called as soon as the game is instantiated, i.e. at state 0.0.0. All event listeners declared here will stay valid throughout the game.
 
 - `loop`: The game states container.
    
See below for details

    
    
## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
