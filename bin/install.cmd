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
call npm install smoosh
call npm install ya-csv
call npm install commander
call npm install docker

:: Temporary Fix
call npm install resolve
call npm install wrench

:: Install sub-dependencies; link to tracked dependencies.

cd JSUS
:: call npm install

cd ../descil-mturk
:: call:linkDeps JSUS NDDB
call npm install

cd ../nodegame-mongodb
call npm install

cd ../nodegame-client
:: call:linkDeps JSUS NDDB shelf.js
call npm install

cd ../nodegame-server
:: call:linkDeps JSUS NDDB shelf.js nodegame-widgets
call npm install

:: Patching express connect (copy + rename).
xcopy /Y bin\static.js node_modules\express\node_modules\connect\lib\middleware\static.js

:: Rebuild js files.
cd bin
node make build-client -a -o nodegame-full

:: Install ultimatum game.
cd ../../../

git clone https://github.com/nodeGame/ultimatum.git games/ultimatum
:: Executes the following commands to try out the ultimatum game.

:: Start the ultimatum game.
:: node start/ultimatum-server


:: Open two browser tabs for two players at the address:
:: http://localhost:8080/ultimatum/
:: Open the admin console at:
:: http://localhost:8080/ultimatum/monitor.htm
:: See the wiki documentation to modify settings.

:: Not used for now.

:: Add symbolic links to given dependencies that are in nodegame/node_modules
:: (e.g. JSUS, NDDB)

:: :linkDeps
:: mkdir node_modules
:: cd node_modules
:: for /l %%x in (1, 1, %argCount%) do (
::     mklink "../../%%x" "."
:: )
:: GOTO:EOF