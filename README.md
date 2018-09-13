# nodeGame

Fast, scalable JavaScript for large-scale, online, multiplayer, real-time games
and experiments.

---

## The Good parts

 - Open source and open standard (HTML5)
 - Modular framework (server / client / window / widgets / games)
 - Low / medium level of programming required
 - Powerful API
 - Integrated
   [NDDB](http://nodegame.github.com/NDDB/docs/nddb.js.html)
   Javascript database
 - Server can run multiple games at the same time
 - Powerful and customizible waiting rooms
 - Monitor interface
 - Works on mobile devices and tablets
 - Bots (for playing) and Phantoms (for testing)
 - Installation is required only for the server, clients just need their browser windows
 - Integrates smoothly with other libraries (e.g. jQuery, D3.js, etc.)
   and web services, such as Amazon Mechanical Turk

## Quick Start

nodeGame comes with a default game taken from the academic literature
of game theory. It is called the
[Ultimatum](http://en.wikipedia.org/wiki/Ultimatum_game) game. To play
it follows the steps:


  1. Download the latest version of [node.js](http://nodejs.org) for
  your platform
  2. Download the latest version of [git](http://www.git-scm.com) for
  your platform
  3. Download [installer](http://nodegame.org/nodegame-installer.js), and install nodegame: `node nodegame-installer`
  4. Enter installation directory.
  5. Start the server with the command: `node launcher.js`
  6. Open one tab pointing to `localhost:8080`
  7. Select Ultimatum game
  8. Open more tabs, or start a bot through the waiting room interface
  7. Check the monitor interface at
  `localhost:8080/ultimatum/monitor`
  
## Documentation

Complete documentation is available in the nodeGame
[wiki](https://github.com/nodeGame/nodegame/wiki).

## License

[MIT](LICENSE)
