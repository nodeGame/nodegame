#!/bin/bash
# nodeGame install from sources script
# Copyright(c) 2015 Stefano Balietti
# MIT Licensed

# Check node.js version, must be higher than 0.8.
node_version=$(node --version)  # e.g. "v0.10.20"
node_version=${node_version#v}  # e.g. "0.10.20"
node_major=$(cut -d. -f1 <<< $node_version)
node_minor=$(cut -d. -f2 <<< $node_version)
if (( node_major <= 0 && node_minor < 10 ))
then
    echo "node.js version >= 0.10 required."
    exit 1
fi

# Return on failure immediately.
set -e

# Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git
cd nodegame

# Install the dependencies.
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

# Entering nodegame-server directory.
cd node_modules/nodegame-server
 
# Patching express connect.
patch node_modules/express/node_modules/connect/lib/middleware/static.js < \
  bin/ng.connect.static.js.patch
 
# Rebuild js files.
cd bin
node make build-client -a -o nodegame-full

# Install ultimatum game.
cd ../../..
git clone https://github.com/nodeGame/ultimatum games/ultimatum


# Execute the following commands to try out the ultimatum game.

# Start the ultimatum game:
# node start/ultimatum-server

# Open two browser tabs for two players at the address:
# http://localhost:8080/ultimatum/
# Open the admin console at:
# http://localhost:8080/ultimatum/monitor.htm
# See the wiki documentation to modify settings.
