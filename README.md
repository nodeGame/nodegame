# nodeGame

nodeGame is a free, open source, event-driven javascript framework for online, multiplayer games in the browser.

---

nodeGame is a general framework to play any kind of game online, but it specially designed to conduct _social experiments_.

## The Good parts

 - Open source and open standard (HTML5)
 - Modular framework (server / client / window / widgets / games)
 - Low / medium level of programming required
 - Powerful API
 - Integrated [NDDB](http://nodegame.github.com/NDDB/docs/nddb.js.html) Javascript database
 - Server can run multiple games at the same time
 - Customizable waiting rooms for online games
 - Works on mobile devices and tablets
 - Installation is required only for the server, clients just need their browser windows
 - Integrates smoothly with other libraries (e.g. jQuery, D3.js, etc.) and web services, such as Amazon Mechanical Turk
 
## Important!

The NPM version and the github have diverged. The version on github is the latest, and it is not compatible to the version found on NPM. The instruction for _Quick start_ refers to the old version. If you want to try the new version follow the instructions under _Source codes_.

For further information refer to the documentation in nodeGame [wiki](https://github.com/nodeGame/nodegame/wiki).

## Quick start (Old Version)

nodeGame comes with a default game installed. It is called the [Ultimatum](http://en.wikipedia.org/wiki/Ultimatum_game) game. To play it follows the steps:

  1. Download node.js (from http://nodejs.org/)
  2. From the console type: `npm install nodegame` 
  3. Browse to the nodegame folder and start the server: `node server.js`
  4. Browse to the `./games/ultimatum/server/` folder and start the game logic: `node logic.js`
  5. Open three or more browser windows pointing to `localhost:8080/ultimatum/index.html`

### There is more...

  - A waiting room: `localhost:8080/ultimatum/room.html`
  - A Monitor interface: `localhost:8080/ultimatum/monitor.html`
  - Real time plotting of the results: `localhost:8080/ultimatum/results.html` 
      
## Source codes

All source codes of all repositories of nodeGame and related projects are available at the web page: https://github.com/nodeGame

### Building from sources (Latest Version)

Before going any further make sure you've installed [git](http://git-scm.com) and [node.js](http://nodejs.org) on your machine. Then open your Command Line and follow the instructions below.

    # cd into the directory where you want the repo to reside
    $ cd Desktop
      
    # clone the repo
    $ git clone git://github.com/nodeGame/nodegame.git
      
    # install the dependencies
    $ cd nodegame
    $ mkdir node_modules; cd node_modules
    $ git clone git://github.com/nodeGame/nodegame-client
    $ git clone git://github.com/nodeGame/nodegame-server
    $ git clone git://github.com/nodeGame/nodegame-window
    $ git clone git://github.com/nodeGame/nodegame-widgets
    $ git clone git://github.com/nodeGame/JSUS
    $ git clone git://github.com/nodeGame/NDDB
    
    # install sub-dependencies
    $ cd nodegame-client
    $ npm install        
    $ cd ../../nodegame-server
    $ npm install
    
    $ rebuild js files
    $ node bin/make build-client -a -o nodegame-full
    
    $ install ultimatum game
    $ cd ../../
    $ node clone git://github.com/nodeGame/ultimatum games/
    
    # start the ultimatum game
    $ node start/ultimatum-server
    
    # open two browser tabs for two players at the address
    # http://localhost:8080/ultimatum/
    # open the admin console at
    # http://localhost:8080/ultimatum/monitor.htm
    # game is set to autoplay. See the wiki documentation to modify settings.
    
### Code contributions    

Code contributions are welcome, please keep in mind default [Code Conventions](http://javascript.crockford.com/code.html).

## License

Copyright (C) 2014 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
