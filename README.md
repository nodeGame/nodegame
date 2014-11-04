# nodeGame

nodeGame is a free, open source, real-time javascript framework for online, multiplayer games in the browser.

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

## Quick Start (stable version)

nodeGame comes with a default game taken from the academic literature of game theory. It is called the [Ultimatum](http://en.wikipedia.org/wiki/Ultimatum_game) game. To play it follows the steps:

  1. Download the latest version of [node.js](http://nodejs.org) for your platform
  2. Download the latest version of [git](http://www.git-scm.com) for your platform
  3. Download and run the install scripts for [Mac/Linux](https://raw.githubusercontent.com/nodeGame/nodegame/master/bin/install.stable.sh) or [Windows](https://raw.githubusercontent.com/nodeGame/nodegame/master/bin/install.stable.cmd)
  4. Open a terminal and browse to the `nodegame/` folder
  5. Start the server with the command: `node launcher.js`
  6. Open two or more browser tabs pointing to `localhost:8080/ultimatum`
  7. Open a browser tab pointing to `localhost:8080/ultimatum/monitor.htm`
  
## Source codes (development version)

You can download the development version of nodeGame using the install script for [Mac/Linux](https://raw.githubusercontent.com/nodeGame/nodegame/master/bin/install.latest.sh) or [Windows](https://raw.githubusercontent.com/nodeGame/nodegame/master/bin/install.latest.cmd)

To keep your development version code base up to date you can use the script in `bin/pull-all.sh` (Mac/Linux only).

## Code contributions

Code contributions are welcome, please keep in mind default [Code Conventions](http://javascript.crockford.com/code.html).
Take special care in deleting all trailing white spaces, removeing any `debugger` statement left in the code, and always add an empty line at the end of each file.
All comments are automatically processed using [docker](http://jbt.github.io/docker/src/docker.js.html).

## License

Copyright (C) 2014 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
