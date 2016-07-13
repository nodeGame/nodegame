:: nodeGame install from sources script for Windows
:: Copyright(c) 2016 Stefano Balietti
:: MIT Licensed

:: Enable local extensions (more similar to Bash).
setlocal enableextensions enabledelayedexpansion

:: Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git || exit /b

cd nodegame || exit /b

:: Install the dependencies.
mkdir node_modules || exit /b
cd node_modules || exit /b
git clone https://github.com/nodeGame/nodegame-client.git || exit /b
git clone https://github.com/nodeGame/nodegame-server.git || exit /b
git clone https://github.com/nodeGame/nodegame-window.git || exit /b
git clone https://github.com/nodeGame/nodegame-widgets.git || exit /b
git clone https://github.com/nodeGame/nodegame-requirements.git || exit /b
git clone https://github.com/nodeGame/nodegame-monitor.git || exit /b
git clone https://github.com/nodeGame/JSUS.git || exit /b
git clone https://github.com/nodeGame/NDDB.git || exit /b
git clone https://github.com/nodeGame/shelf.js.git || exit /b
git clone https://github.com/nodeGame/descil-mturk.git || exit /b
git clone https://github.com/nodeGame/nodegame-db.git || exit /b
git clone https://github.com/nodeGame/nodegame-mongodb.git || exit /b

:: The most recent nodejs installer has a bug, this line fixes it.
:: Solution taken from http://stackoverflow.com/q/25093276
if not exist "%APPDATA%\npm" mkdir "%APPDATA%\npm" || exit /b

call npm install smoosh || exit /b
call npm install ya-csv || exit /b
call npm install commander || exit /b

:: Install sub-dependencies; link to tracked dependencies.

cd JSUS || exit /b
call npm install || exit /b

cd ../descil-mturk || exit /b
call:linkDeps JSUS NDDB || exit /b
call npm install || exit /b

cd ../nodegame-mongodb || exit /b
call npm install || exit /b

cd ../nodegame-client || exit /b
call:linkDeps JSUS NDDB shelf.js || exit /b
call npm install || exit /b

cd ../nodegame-server || exit /b
call:linkDeps JSUS NDDB shelf.js nodegame-widgets nodegame-monitor || exit /b
call npm install || exit /b

:: Patching express connect (copy + rename). (not needed in express 4).
:: xcopy /Y bin\static.js node_modules\express\node_modules\connect\lib\middleware\static.js || exit /b

:: Rebuild js files.
cd bin || exit /b
node make build-client -a -o nodegame-full || exit /b

:: Install ultimatum game.
cd ../../../ || exit /b

git clone https://github.com/nodeGame/ultimatum.git games/ultimatum || exit /b


:: Execute the following commands to try out the ultimatum game.

:: Start the server.
:: node launcher


:: Open two browser tabs for two players at the address:
:: http://localhost:8080/ultimatum/
:: Open the admin console at:
:: http://localhost:8080/ultimatum/monitor/
:: See the wiki documentation to modify settings.

exit /b
:: End of script. Following labels used for calls only.

:: Add symbolic links to given dependencies that are in nodegame/node_modules
:: (e.g. JSUS, NDDB)
:linkDeps
mkdir node_modules || exit /b
cd node_modules || exit /b

:linkDepsHelper
mklink /J "./%1" "../../%1" || exit /b
shift
if not [%1]==[] GOTO:linkDepsHelper
cd ../ || exit /b
GOTO:EOF
