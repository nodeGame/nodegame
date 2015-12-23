:: nodeGame install from npm script for Windows
:: Copyright(c) 2015 Stefano Balietti
:: MIT Licensed

:: Enable local extensions (more similar to Bash).
setlocal enableextensions enabledelayedexpansion


:: The most recent nodejs installer has a bug, this line fixes it.
:: Solution taken from http://stackoverflow.com/q/25093276
if not exist "%APPDATA%\npm" mkdir "%APPDATA%\npm" || exit /b

:: Get the stable repo.
call npm install nodegame || exit /b
move node_modules/nodegame . || exit /b
rmdir node_modules || exit /b

cd nodegame || exit /b

:: Install the dependencies.
call npm install nodegame-client || exit /b
call npm install nodegame-server || exit /b
call npm install nodegame-window || exit /b
call npm install nodegame-widgets || exit /b
call npm install JSUS || exit /b
call npm install NDDB || exit /b
call npm install shelf.js || exit /b
call npm install descil-mturk || exit /b
call npm install nodegame-db || exit /b
call npm install nodegame-mongodb || exit /b
call npm install nodegame-generator || exit /b
call npm install nodegame-requirements || exit /b
call npm install nodegame-monitor || exit /b
call npm install smoosh || exit /b
call npm install ya-csv || exit /b
call npm install commander || exit /b
call npm install ultimatum-game || exit /b
:: docker not installed


:: Entering nodegame-server directory
cd node_modules/nodegame-server/ || exit /b
 
:: Patching express connect. (not needed in new version).
:: xcopy /Y bin\static.js node_modules\express\node_modules\connect\lib\middleware\static.js || exit /b
 
:: Rebuild js files.
cd bin/ || exit /b
node make build-client -a -o nodegame-full || exit /b

:: Install ultimatum game.
cd ../../../ || exit /b
move node_modules/ultimatum-game games/ultimatum || exit /b


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
