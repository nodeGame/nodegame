#!/bin/sh
# nodeGame install from sources script
# Copyright(c) 2014 Stefano Balietti
# MIT Licensed

# clone the repo
git clone git@github.com:nodeGame/nodegame.git
cd nodegame

# install the dependencies
mkdir node_modules; cd node_modules
git clone git@github.com:nodeGame/nodegame-client
git clone git@github.com:nodeGame/nodegame-server
git clone git@github.com:nodeGame/nodegame-window
git clone git@github.com:nodeGame/nodegame-widgets
git clone git@github.com:nodeGame/JSUS
git clone git@github.com:nodeGame/NDDB
git clone git@github.com:nodeGame/shelf.js
git clone git@github.com:nodeGame/descil-mturk
git clone git@github.com:nodeGame/nodegame-db
git clone git@github.com:nodeGame/nodegame-mongodb
npm install smoosh
npm install ya-csv
npm install commander
npm install docker


# install sub-dependencies
cd JSUS; npm install
cd ../descil-mturk; npm install
cd ../nodegame-mongodb; npm install
cd ../nodegame-client; npm install
cd ../nodegame-server; npm install

# patching express connect
cd bin; patch ../node_modules/express/node_modules/connect/lib/middleware/static.js < ng.connect.static.js.patch

# rebuild js files
node make build-client -a -o nodegame-full

# install ultimatum game
cd ../../../
git clone git@github.com:nodeGame/ultimatum games/ultimatum

# start the ultimatum game
# node start/ultimatum-server

# open two browser tabs for two players at the address
# http://localhost:8080/ultimatum/
# open the admin console at
# http://localhost:8080/ultimatum/monitor.htm
# game is set to autoplay. See the wiki documentation to modify settings.
