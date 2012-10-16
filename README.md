# nodeGame

nodeGame is a free, open source, event-driven javascript framework for online, multiplayer games in the browser.

---

nodeGame is a general framework to play any kind of game online, but it specially designed to conduct _social experiments_.

## The Good parts

 - Open source and open standard (HTML5)
 - Modular framework (games + widgets)
 - Low / Medium level of programming required
 - Powerful API
 - Real-time plotting with [d3.js](http://d3js.org)
 - Integrated Javascript [database](http://nodegame.github.com/NDDB/docs/nddb.js.html)
 - Server can run multiple games at the same time
 - Customizable waiting rooms for online games
 - Works on mobile devices and tablets
 - Installation is required only for the server, clients just need their browser windows
 - Integrates smoothly with other libraries and web services, such as Amazon Mturk
 - Find out what more...

## Quick start

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

For further information see the [README](https://github.com/nodeGame/nodeGame/blob/master/doc/README.md) in the doc folder.
      

## Contribute

Any help is always appreciated, however please keep the our default [Code Conventions](http://javascript.crockford.com/code.html) in mind.

## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
