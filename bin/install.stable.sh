#!/bin/bash
# nodeGame install from sources script
# Copyright(c) 2014 Stefano Balietti
# MIT Licensed

# Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git
cd nodegame;

# Install the dependencies.
# mkdir -p node_modules; cd node_modules
npm install nodegame-client
npm install nodegame-server
npm install nodegame-window
npm install nodegame-widgets
npm install JSUS
npm install NDDB
npm install shelf.js
npm install descil-mturk
npm install nodegame-db
npm install nodegame-mongodb
npm install smoosh
npm install ya-csv
npm install commander
npm install docker

# Entering nodegame-server directory
cd node_modules/nodegame-server/;
 
# Patching express connect.
patch node_modules/express/node_modules/connect/lib/middleware/static.js < bin/ng.connect.static.js.patch;
 
# Rebuild js files.
cd bin/;
node make build-client -a -o nodegame-full;

# Install ultimatum game.
cd ../../../;
git clone https://github.com/nodeGame/ultimatum games/ultimatum;

# Executes the following commands to try out the ultimatum game.

# Start the ultimatum game.
# node start/ultimatum-server

# Open two browser tabs for two players at the address:
# http://localhost:8080/ultimatum/
# Open the admin console at:
# http://localhost:8080/ultimatum/monitor.htm
# See the wiki documentation to modify settings.
