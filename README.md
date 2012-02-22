# nodeGame
---

Javascript framework (node.js + socket.io) for online multiplayer games in the browser.

## Setup (Dev-Env for Unix Systems)

  # Install the Node.js Server
  $ git clone git://github.com/joyent/node.git
  $ cd node/
  $ git checkout v0.6.12
  $ ./configure
  $ sudo make
  $ sudo make install
  
  # Install Dependencies
  $ npm install
  
  # Make a clean build of nodeGame
  $ cd client/
  $ ./build
  
  # Start the management server
  $ cd server/
  $ node server.js
  
  # Open 2 different browser instances with the pr-example
  $ open localhost:8080/examples/pr/index.html
  
  # (optional) Monitor the game via the browser
  $ open localhost:8080/examples/pr/monitorgame.html
  
  # Start the game
  $ cd client/nodeclient
  $ node pr.js
  
  # Game runs through (might not be too obvious)

## Example

See doc folder for now.

## License

Not yet decided.
