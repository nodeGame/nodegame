/**
 * # Start nodeGame Server
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.
const path = require("path");
const J = require("JSUS").JSUS;


module.exports = function (program, vars) {

    const rootDir = vars.rootDir;
    const version = vars.version;

    const conf = {
        author: 'author',
        email: 'email',
        ngDir: rootDir,
        ngVersion: version,
        ngGamesAvailDir: path.join(rootDir, 'games_available'),
        ngGamesEnabledDir: path.join(rootDir, 'games')
    };


    const exp = require(
        path.resolve(rootDir, 'bin', 'commands', 'lib', 'export.js'));

    program
        .command('export-data <game>')
        .description('Exports data from a game.')
        // Input/Output
        .option('    --games-dir <dir>', 'games directory (default games/)')
        .option('    --export-dir <dir>', 'export directory (default export)')
        .option('    --create-export-sub-dir', 'create sub-directory inside export directory')
        .option('-r, --recursive', 'recursively search for files')
        .option('    --files <files>', 'comma separated list of files/patterns')
        .option('    --files-add <files>', 'comma separated list of ' +
                'files/patterns to add to defaults')
        .option('    --out-format <format>', 'the export format (json,ndjson,csv)')
        .option('    --in-format <format>', 'the import format (json,ndjson,csv)')
        // Handle errors.
        .option('    --on-duplicated-names <action>', 'action to take if a file ' +
            'with same name exists in export directory (rename|append|err)')
        .option('-t, --throw', 'throws errors (default continues to next file)')
        // Filters.
        .option('    --rooms <rooms>', 'room/s to export')
        .option('    --from-room <room>', 'export from room (included)')
        .option('    --to-room <room>', 'export up to room (included)')
        // Process.
        .option('    --on-insert <file.js>', 'path to file exporting a function to modify items')
        // CSV
        .option('    --out-csv-flatten [group]', 'merges all items [by group] before export')
        .option('    --out-csv-header <header>', 'header for export csv files (comma separeted values)')
        .option('    --out-csv-no-header', 'no header in export csv files')
        .option('    --out-csv-obj-level <level>', 'level of nested objects to expand before export')
        .option('    --in-csv-header <header>', 'header for import csv files (comma separeted values)')
        .option('    --in-csv-no-header', 'no header in import csv files')
        // Verbose.
        .option('-v, --verbose', 'verbose output')
        .allowUnknownOption()
        .action(function(game, opts) {
            // console.log(arguments);
            opts.game = game;
            processExportOptions(opts);

            // loadConfFile(() => exp.data(conf, opts, terminateExport));
            exp.data(conf, opts, terminateExport);


        })
        // .parse(process.argv);


    program
        .command('export-logs')
        .description('Exports logs from nodeGame server')
        // Input/Output
        .option('    --log-dir <dir>', 'log directory (default log/)')
        .option('    --export-dir <dir>', 'export directory (default export)')
        .option('    --create-export-sub-dir', 'create sub-directory inside export directory')
        .option('-r, --recursive', 'recursively search for files')
        .option('    --files <files>', 'comma separated list of files/patterns')
        .option('    --files-add <files>', 'comma separated list of ' +
                'files/patterns to add to defaults')
        .option('    --out-format <format>', 'the export format (json,ndjson,csv)')
        .option('    --in-format <format>', 'the import format (json,ndjson,csv)')
        // Handle errors.
        .option('    --on-duplicated-names <action>', 'action to take if a file ' +
                'with same name exists in export directory (rename|append|err)')
        .option('-t, --throw', 'throws errors (default continues to next file)')
        // Filters.
        .option('    --game <game>', 'export logs only for this game')
        .option('    --set-msg-only', 'exports only "set" messages (e.g., "done" msgs)')
        .option('    --clean-up', 'cleanup logs before export')
        .option('    --msg-type <type>', 'messages to export (incoming|outgoing|all)')
        // CSV
        .option('    --out-csv-flatten [group]', 'merges all items [by group] before export')
        .option('    --out-csv-header <header>', 'header for export csv files (comma separeted values)')
        .option('    --out-csv-no-header', 'no header in export csv files')
        .option('    --out-csv-obj-level <level>', 'level of nested objects to expand before export')
        .option('    --in-csv-header <header>', 'header for import csv files (comma separeted values)')
        .option('    --in-csv-no-header', 'no header in import csv files')
        // Verbose.
        .option('-v, --verbose', 'verbose output')
        .allowUnknownOption()
        .action(function(opts) {
            debugger
            processExportOptions(opts);

            // loadConfFile(() => exp.logs(conf, opts, terminateExport));
            exp.logs(conf, opts, terminateExport);


        })
        // .parse(process.argv);

};



/**
 * ## processExportOptions
 *
 * Calls process.exit otherwise the process hangs
 */
const processExportOptions = opts => {
    if (opts.throw) {
        opts.onError = 'throw';
        delete opts.throw;
    }

    if (opts.logDir) {
        opts.dataDir = opts.logDir;
        delete opts.logDir;
    }

    if (opts.gamesDir) {
        opts.dataDir = opts.gamesDir;
        delete opts.gamesDir;
    }

    if (opts.msgType) {
        let m = opts.msgType;
        if (m === 'incoming' || m === 'all') opts.incoming = true;
        if (m === 'outgoing' || m === 'all') opts.outgoing = true;
        delete opts.msgType;
    }

    if ('string' === typeof opts.files) opts.files = opts.files.split(',');
    if (opts.filesAdd) opts.filesAdd = opts.filesAdd.split(',');

    if ('string' === typeof opts.outCsvHeader) {
        opts.outCsvHeader = opts.outCsvHeader.split(',');
    }
    if (opts.outCsvNoHeader) opts.outCsvHeader = false;

    if ('string' === typeof opts.inCsvHeader) {
        opts.inCsvHeader = opts.inCsvHeader.split(',');
    }
    if (opts.inCsvNoHeader) opts.inCsvHeader = false;

    if (opts.outCsvObjLevel) opts.outCsvObjLevel = J.isInt(opts.outCsvObjLevel);

    if (opts.outCsvFlatten) {
        if ('string' === typeof opts.outCsvFlatten) {
            opts.outCsvFlattenByGroup = opts.outCsvFlatten;
            opts.outCsvFlatten = true;
        }
    }

    if (opts.onInsert) {
        let p = opts.onInsert;
        // console.log(p);
        if (!path.isAbsolute(p) && !p.substring(0,2) === "./") {
            p = "./" + p;
        }

        try {
            p = require(p);
            if ('function' !== typeof p) {
                console.log('Error: on-insert did not return a function');
                opts.onInsert = null;    
            }
            else {
                opts.onInsert = p;
            }
        }
        catch(e) {
            if (opts.verbose) console.log(e);
            console.log('Error: could not load on-insert function');
            opts.onInsert = null;
        }
    }
};

/**
 * ## terminateExport
 *
 * Calls process.exit otherwise the process hangs
 */
const terminateExport = () => {
    console.log();
    console.log(' *** Export finished.');
    console.log();
    process.exit();
};