# NODEGAME TODO LIST
---

* change nodegame-server so that files are getting server no matter if server.js is called within the server dir or the nodeGame dir.
* hookup button click events to socket.io -> so if 'Done' gets clicked a socket.io event gets triggered.
* implement a heroku mode where ports are taken care of. -> proxying on heroku -> hence port 80
* implement express html insertion functionality

---
# IMPORTANT

* when pushing to heroku do not define ports when instantiating a new server

* concatinated nodegame.js file for server needs to be added to the repo or we need to use heroku specific hooks
-> since heroku doesn't allow us to write to their filesystem

## Conventions

* foreach game there has to be a seperate folder.
* browser and server logic reside within the same folder (for easier management and maintanability)
* game logic is called logic.js -> depencies of this logic.js can be called whatever they want but will be server to the client.