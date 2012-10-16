# nodeGame on Heroku (experimental)

- last update: 16/10/2012 
- status: incomplete

## Getting started

    # Clone the repository
    $ git clone git://github.com/nodeGame/nodeGame.git
    $ cd nodeGame

    # Install the heroku CLI tools & create an account
    $ open https://toolbelt.heroku.com/
    $ heroku create your-app-name --stack cedar

    $ git remote add heroku git@heroku.com:your-app-name.git
    $ git push heroku master

    $ open https://your-app-name.herokuapp.com

    # Before starting the game edit the url portion of logic.js to reflect you heroku url.
    $ node games/ultimatum/server/logic.js
    
    
## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
