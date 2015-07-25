/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets conf, log, and games directory and start the server.
 *
 * http://www.nodegame.org
 */

// Modules.
var fs = require('fs');
var exec = require('child_process').exec;

// Load commander.
var program = require('commander');

// Load the ServerNode class.
var ServerNode = require('nodegame-server').ServerNode;

// nodeGame version.
var version = require('./package.json').version;

// ServerNode object.
var sn;

// ServerNode options.
var options;

// Other local options.
var confDir, logDir, debug, infoQuery;
var nClients, clientType, killServer;

// Warn message.
var ignoredOptions;

ignoredOptions = [];

// Defaults.

confFile = null;

confDir = './conf';
logDir = './log';
gamesDir = './games';
debug = false;
infoQuery = false;

nClients =  4;
clientType = 'autoplay';
runTests = false;
killServer = false;

// Commander.

program
    .version(version)

    // Specify a configuration file (other inline-options will be ignored).

    .option('-C, --config [confFile]',
            'Specifies a configuration file to load')

    // Specify inline options (more limited than a conf file, but practical).

    .option('-c, --confDir [confDir]',
            'Sets the configuration directory')
    .option('-l, --logDir [logDir]',
            'Sets the log directory')
    .option('-g, --gamesDir [gamesDir]',
            'Sets the games directory')
    .option('-d, --debug',
            'Enables the debug mode')
    .option('-i, --infoQuery',
            'Enables getting information via query-string ?q=')


    // Connect phantoms. 

    .option('-p, --phantoms [channel]',
            'Connect phantoms to the specified channel')
    .option('-n, --nClients [n]',
            'Sets the number of clients phantoms to connect')
    .option('-t, --clientType [t]',
            'Sets the client type of connecting phantoms')
    .option('-T, --runTests',
            'Run tests after all phantoms have reached game over ' +
            '(overwrites settings.js in test/ folder')
    .option('-k, --killServer',
            'Kill server after all phantoms have reached game over')


    .parse(process.argv);


if (program.confFile) {
    if (!fs.existSync(progam.ConfFile)) {
        return printErr('--confFile ' + program.confFile + ' not found.');
    }
    options = require(program.confFile);
    if ('object' !== typeof options) {
        return printErr('--confFile ' + program.confFile + ' did not return ' +
                        'a configuration object.');
    }

    if (program.confDir) ignoredOptions.push('--confDir');
    if (program.logDir) ignoredOptions.push('--logDir');
    if (program.gamesDir) ignoredOptions.push('--gamesDir');
    if (program.debug) ignoredOptions.push('--debug');
    if (program.infoQuery) ignoredOptions.push('--infoQuery');
}
else {

   options = {

        // Additional conf directory.
        confDir: confDir,
        
        // Log Dir
        logDir: logDir,
        
        servernode: function(servernode) {
            // Special configuration for the ServerNode object.
            
            // Adds a new game directory (Default is nodegame-server/games).
            servernode.gamesDirs.push(gamesDir);
            // Sets the debug mode, exceptions will be thrown.
            servernode.debug = debug;
            // Can get information from /?q=
            servernode.enableInfoQuery = infoQuery;
            // Basepath (without trailing slash).
            // servernode.basepath = '/mybasepath';

            return true;
        },
        http: function(http) {
            // Special configuration for Express goes here.
            return true;
        },
        sio: function(sio) {
            // Special configuration for Socket.Io goes here here.
            // Might not work in Socket.IO 1.x (check).

            // sio.set('transports', ['xhr-polling']);
            // sio.set('transports', ['jsonp-polling']);

            // sio.set('transports', [
            //   'websocket'
            // , 'flashsocket'
            // , 'htmlfile'
            // , 'xhr-polling'
            // , 'jsonp-polling'
            // ]);

            return true;
        }
    };

    // Validate other options.
    if (program.confDir) {
        if (!fs.existSync(program.confDir)) {
            return printErr('--confDir ' + program.confDir + ' not found.');
        }
        confDir = program.confDir;
    }
    if (program.logDir) {
        if (!fs.existSync(program.logDir)) {
            return printErr('--logDir ' + program.logDir + ' not found.');
        }
        logDir = program.logDir;
    }
    if (program.gamesDir) {
        if (!fs.existSync(program.gamesDir)) {
            return printErr('--gamesDir ' + program.gamesDir + ' not found.');
        }
        gamesDir = program.gamesDir;
    }
    if (program.debug) debug = true;
    if (program.infoQuery) infoQuery = true;
}

// Validate general options.

if (program.nClients) {
    if (!program.phantoms) ignoredOptions.push('--nClients');
    else {
        nClients = parseInt(program.nClients, 10);
        if (isNaN(nClients)) {
            return printErr('--nClients ' + program.nClients +
                            ' is invalid.');
        }
    }
}
if (program.clientType) {
    if (!program.phantoms) ignoredOptions.push('--clientType');
    else clientType = program.clientType;
}
if (program.runTests) {
    if (!program.runTests) ignoredOptions.push('--runTests');
    else runTests = program.runTests;
}
if (program.killServer) {
    if (!program.phantoms) ignoredOptions.push('--killServer');
    else killServer = true;
}

// Print warnings, if any.
printIgnoredOptions();

// Start server, options parameter is optional.
sn = new ServerNode(options);

sn.ready(function() {
    var i, phantoms, handleGameover;
    var gameName, gameDir, queryString;
    var numFinished;

    // If there are not bots to add returns.
    if (!program.phantoms) return;

    gameName = program.phantoms;
    if (!sn.channels[gameName]) {
        printErr('channel ' + gameName + ' was not found.');
        if (killServer) process.exit();
        return;
    }
    gameDir = sn.channels[gameName].getGameDir();
    
    if (clientType) {
        queryString = '?clientType=' + clientType;
    }

    phantoms = [];
    for (i = 0; i < nClients; ++i) {
        console.log('Connecting phantom #', i+1, '/', nClients);
        phantoms[i] = sn.channels[gameName].connectPhantom({
            queryString: queryString
        });
    }

    // TODO: Listen for room creation instead of timeout.
    //setTimeout(function() {
    //    var node;
    //    node = sn.channels.ultimatum.gameRooms["ultimatum1"].node;
    //    node.events.ee.ng.on(
    //        'GAME_OVER', function() {console.log('The game is over now.');});
    //}, 5000);

    if (killServer || runTests) {
        handleGameover = function() {
            var command;

            console.log();
            console.log(gameName + ' game has run successfully.');
            console.log();

            if (runTests) {
                command = gameDir + 'node_modules/.bin/mocha';
                if (fs.existsSync(command)) {

                    // Write and backup settings file.
                    writeSettingsFile(gameDir);

                    command += ' ' + gameDir + 'test/ --colors';
                    testProcess = exec(command, function(err, stdout, stderr) {
                        if (stdout) console.log(stdout);
                        if (stderr) console.log(stderr);
                        testProcess.kill();
                        if (killServer) process.exit();
                    });
                }
                else {
                    printErr('Cannot run tests, mocha executable not found: ',
                            command);
                }
            }
            else if (killServer) process.exit();
        };

        // Wait for all PhantomJS processes to exit, then stop the server.
        numFinished = 0;
        for (i = 0; i < nClients; ++i) {
            phantoms[i].on('exit', function(code) {
                numFinished ++;
                if (numFinished == nClients) {
                    handleGameover();
                }
            });
        }
    }
});

// ## Helper functions.

function printIgnoredOptions() {
    if (ignoredOptions.length) {
        console.log('    ignored options:', ignoredOptions.join(', '));
        console.log();
        console.log();
    }
}

function printErr(err) {
    console.log('    Check the input parameters.');
    console.log('    Error: ' + err);
}

function writeSettingsFile(gameDir) {
    var testProcess, settings, settingsFile, bak;
    settings = 'module.exports = { numPlayers: ' + nClients + ' };';
    settingsFile = gameDir + 'test/settings.js';
    // Make a backup of existing settings file, if found.
    if (fs.existsSync(settingsFile)) {
        bak = fs.readFileSync(settingsFile).toString();
        fs.writeFileSync(settingsFile + '.bak', bak,  { mode: 0666 } );
    }
    // Write updated settings file.
    fs.writeFileSync(gameDir + 'test/settings.js', settings, { mode: 0666 } );
}

// Exports the ServerNode instance.
module.exports = sn;
