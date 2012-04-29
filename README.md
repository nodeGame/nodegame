# nodeGame

Javascript framework (node.js + socket.io) for online multiplayer games in the browser.

---

## Trying this nodeGame instance on heroku

      # Clone the repository
      $ git clone git://github.com/shakty/nodeGame.git
      $ cd nodeGame

      # Install the heroku CLI tools
      $ heroku create your-app-name --stack cedar

      $ git remote add heroku git@heroku.com:your-app-name.git
      $ git push heroku master

      $ open https://your-app-name.herokuapp.com

## Setup (Dev-Env for Unix Systems)

      # Install the Node.js Server
      $ git clone git://github.com/joyent/node.git
      $ cd node/
      $ git checkout v0.6.11
      $ ./configure
      $ sudo make
      $ sudo make install

      # Install the heroku toolbelt
      $ open https://toolbelt.herokuapp.com/
  
      # Clone nodeGame
      $ cd /into/the/place/where/you/put/project/folders
      $ git clone git://github.com/shakty/nodeGame.git
      $ cd nodeGame/
  
      # Install Dependencies
      $ npm install (be aware of http://goo.gl/T8m9d)
  
      # Start the management server
      $ foreman start
  
      # Open 2 different browser instances with the ultimatum game example
      $ open http://localhost:5000/ultimatum/index.html
  
      # (optional) Monitor the game via the browser
      $ open http://localhost:5000/ultimatum/monitorgame.html
  
      # Start the game
      $ cd nodegame_clients/
      $ node ultimatum.js
  
      # Game runs through (might not be too obvious)

## Example

See doc folder for now.

## Contribute

Any help is always appreciated, however please keep the our default [Code Conventions](http://javascript.crockford.com/code.html) in mind.

## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
