:: nodeGame install from npm script for Windows
:: Copyright(c) 2014 Stefano Balietti
:: MIT Licensed

:: Enable local extensions (more similar to Bash).
setlocal enableextensions enabledelayedexpansion


:: The most recent nodejs installer has a bug, this line fixes it.
:: Solution taken from http://stackoverflow.com/q/25093276
if not exist "%APPDATA%\npm" mkdir "%APPDATA%\npm"

:: Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git

cd nodegame

:: Install the dependencies.
call npm install nodegame-client
call npm install nodegame-server
call npm install nodegame-window
call npm install nodegame-widgets
call npm install JSUS
call npm install NDDB
call npm install shelf.js
call npm install descil-mturk
call npm install nodegame-db
call npm install nodegame-mongodb
call npm install smoosh
call npm install ya-csv
call npm install commander
:: docker not installed


:: Entering nodegame-server directory
cd node_modules/nodegame-server/
 
:: Patching express connect.
xcopy /Y bin\static.js node_modules\express\node_modules\connect\lib\middleware\static.js
 
:: Rebuild js files.
cd bin/
node make build-client -a -o nodegame-full

:: Install ultimatum game.
cd ../../../
git clone https://github.com/nodeGame/ultimatum games/ultimatum


:: Execute the following commands to try out the ultimatum game.

:: Start the ultimatum game.
:: node start/ultimatum-server

:: Open two browser tabs for two players at the address:
:: http://localhost:8080/ultimatum/
:: Open the admin console at:
:: http://localhost:8080/ultimatum/monitor.htm
:: See the wiki documentation to modify settings.

exit /b
:: End of script.
