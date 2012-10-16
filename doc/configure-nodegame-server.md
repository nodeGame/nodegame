# Configure nodeGame server

- last update: 16/10/2012 
- status: incomplete

## Introduction

TODO...


### Launcher file

```js
    var ServerNode = require('nodegame-server').ServerNode;
    
    var options = {
        confDir: './conf',
        servernode: function (servernode) {
          servernode.verbosity = 10;
          servernode.gamesDirs.push('./games');
          return true;
        },
        http: function (http) {
          // Special configuration here
          return true;
        },
        sio: function (sio) {
          // Special configuration here
          return true;
        },
    }
    // Start the server
    
    // Input parameter is optional
    var sn = new ServerNode(options);
    
    sn.addChannel({
        name: 'Ultimatum',
        admin: 'ultimatum/admin',
        player: 'ultimatum',
        game: 'ultimatum',          
    });
```

```js
    

### node forever

If you want to make sure that your server stays always up you can read this great tutorial:

- http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever
    
    
## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
