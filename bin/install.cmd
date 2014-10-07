:: nodeGame install from sources script for Windows
:: Copyright(c) 2014 Stefano Balietti
:: MIT Licensed

:: Enable local extensions (more similar to Bash).
setlocal enableextensions enabledelayedexpansion

:: Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git
cd nodegame

:: Install the dependencies.
mkdir node_modules & cd node_modules
git clone https://github.com/nodeGame/nodegame-client.git
git clone https://github.com/nodeGame/nodegame-server.git
git clone https://github.com/nodeGame/nodegame-window.git
git clone https://github.com/nodeGame/nodegame-widgets.git
git clone https://github.com/nodeGame/JSUS.git
git clone https://github.com/nodeGame/NDDB.git
git clone https://github.com/nodeGame/shelf.js.git
git clone https://github.com/nodeGame/descil-mturk.git
git clone https://github.com/nodeGame/nodegame-db.git
git clone https://github.com/nodeGame/nodegame-mongodb.git
npm install smoosh
npm install ya-csv
npm install commander
npm install docker

:: Add symbolic links to given dependencies that are in nodegame/node_modules
:: (e.g. JSUS, NDDB)
function link_deps {
    mkdir node_modules
    (
        cd node_modules
        for dep in "$@"
        do  ln -s "../../$dep" .
        done
    )
}

:: Install sub-dependencies; link to tracked dependencies.
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

:: Patching express connect.
robocopy bin/ng.connect.static.js.copy node_modules/express/node_modules/connect/lib/middleware/static.js

:: Rebuild js files.
cd bin
node make build-client -a -o nodegame-full

:: Install ultimatum game.
cd ../../../
git clone https://github.com/nodeGame/ultimatum games/ultimatum.git

:: Executes the following commands to try out the ultimatum game.

:: Start the ultimatum game.
:: node start/ultimatum-server

:: Open two browser tabs for two players at the address:
:: http://localhost:8080/ultimatum/
:: Open the admin console at:
:: http://localhost:8080/ultimatum/monitor.htm
:: See the wiki documentation to modify settings.
