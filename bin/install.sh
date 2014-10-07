#!/bin/bash
# nodeGame install from sources script
# Copyright(c) 2014 Stefano Balietti
# MIT Licensed

# clone the repo
git clone git@github.com:nodeGame/nodegame.git
cd nodegame

# install the dependencies
mkdir -p node_modules; cd node_modules
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

# add symbolic links to given dependencies that are in nodegame/node_modules
# (e.g. JSUS, NDDB)
function link_deps {
    mkdir -p node_modules
    (
        cd node_modules
        for dep in "$@"
        do  ln -s "../../$dep" .
        done
    )
}

# install sub-dependencies; link to tracked dependencies
cd JSUS
npm install

cd ../descil-mturk
link_deps JSUS NDDB
npm install

cd ../nodegame-mongodb
npm install

cd ../nodegame-client
link_deps JSUS NDDB shelf.js
npm install

cd ../nodegame-server
link_deps JSUS NDDB shelf.js nodegame-widgets
npm install

# patching express connect
patch node_modules/express/node_modules/connect/lib/middleware/static.js < bin/ng.connect.static.js.patch

# rebuild js files
cd bin;
node make build-client -a -o nodegame-full

# install ultimatum game
cd ../../../
git clone git@github.com:nodeGame/ultimatum games/ultimatum

# TODO: Check docker installation.

# start the ultimatum game
# node start/ultimatum-server

# open two browser tabs for two players at the address
# http://localhost:8080/ultimatum/
# open the admin console at
# http://localhost:8080/ultimatum/monitor.htm
# game is set to autoplay. See the wiki documentation to modify settings.
