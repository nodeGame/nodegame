const path = require('path');
const fs = require('fs');
const NDDB = require('NDDB');
const J = require('JSUS').JSUS;

// Keeps track of open processing operations
let processing = 0;

const exportLogs = (serverConf, opts, cb) => {
    _export('logs', serverConf, opts, cb);
};

const exportData = (serverConf, opts, cb) => {
    _export('data', serverConf, opts, cb);
};

// Generic export for data or logs.
const _export = (type, serverConf, opts, cb) => {

    // console.log(type)
    // console.log(serverConf)
    // console.log(opts)
    // console.log(cb);

    const LOGS = type === 'logs';

    setDefaults(LOGS, serverConf, opts);

    // We will clone it later.
    let optsOrig = opts;

    // Data directory.
    const DATADIR = opts.dataDir;
    // Output directory.
    const OUTDIR = opts.exportDir;
    // Verbose.
    const V = opts.verbose;

    // Load all files.
    let checkUnique = {};
    opts.files.forEach((file) => {
        if (checkUnique[file]) {
            if (V) console.log(`- skipping duplicated file: ${file}`);
            return;
        }
        // console.log(optsOrig)
        let opts = optsOrig;
        try {
            opts = J.clone(optsOrig);
        }
        catch {};

        if (V) console.log('- Pattern: ' + file);

        checkUnique[file] = true;

        let db = NDDB.db();
        let db2;

        if (opts.inCsvHeader) opts.header = opts.inCsvHeader;

        // Logs.
        if (LOGS) {
            db2 = NDDB.db();
            db.on('insert', (item) => {
                if (item.type === 'out-ID') {
                    if (!opts.outgoing) return false;
                }
                else if (item.type === 'in') {
                    if (!opts.incoming) return false;
                }

                let  i = item;
                // console.log(i);
                // console.log(i.sid);
                if (opts.game) {

                    // messages logs
                    if (i.channel) {
                        if (i.channel !== opts.game) return false;
                    }

                    // channel logs
                    else if (i.name) {
                        if (i.name !== opts.game) return false;
                    }
                    // servernode logs.
                    else if (i.message) {
                        if (!~i.message.indexOf(opts.game)) return false;
                    }
                }

                try {
                    i = J.parse(item.message);
                    i.type = item.type === 'in' ? 'in' : 'out';
                    i.channel = item.channel || item.name || 'NA';
                }
                catch {};


                if (opts.setMsgOnly) {
                    if (!i.action || i.action !== "set") return false;
                }

                // Session is the server session (not the room number).
                if (opts.session && i.session !== opts.session) return false;

                if (opts.cleanUp) {
                    // i.player = i.from;
                    // delete i.from;
                    delete i.id;
                    delete i.sid;
                }

                if (opts.onInsert) {
                    let res = opts.onInsert(item);
                    if (res === false) return;
                }

                db2.insert(i);
            });
        }
        // Data.
        else {
            if (file === 'bonus_prolific.csv') {

                if ('undefined' === typeof opts.header) opts.header = false;
                opts.quote =  '';
            }

            if (opts.onInsert) db.on('insert', opts.onInsert);
        }

        // Load files.
        opts.filter = file;
        opts.file = file;
        if (opts.inFormat) opts.format = opts.inFormat;
        else if (LOGS) opts.format = 'ndjson';

        db.loadDirSync(DATADIR, opts);
        processing++;

        // Check size.
        if (V) console.log('    items loaded: ' + db.size());

        // No items exit here.
        if (!db.size()) return checkProcessing(cb);
        let outFile = getExportFilename(serverConf, opts, V);

        // We set the in-format before, now we make sure out-format is correct.
        if (opts.outFormat) opts.format = opts.outFormat;
        else delete opts.format;

        if (opts.outCsvHeader) opts.header = opts.outCsvHeader;
        if (opts.outCsvFlatten) opts.flatten = opts.outCsvFlatten;
        if (opts.outCsvFlattenByGroup) {
            opts.flattenByGroup = opts.outCsvFlattenByGroup;
        }

        opts.objectLevel = opts.outCsvObjLevel;

        // Save it.
        if (LOGS) db2.save(outFile, opts, () => checkProcessing(cb));
        else db.save(outFile, opts, () => checkProcessing(cb));
    });
};


const setDefaults = (LOGS, serverConf, opts, game) => {

    opts.exportDir = opts.exportDir ?? getDefaultExportDir(serverConf);

    opts.recursive = opts.recursive ?? false;

    // Converts non-csv formats to csv.
    opts.toCsv = opts.toCsv ?? true;
    // Create a sub-directory within export directory.
    opts.createExportSubDir = opts.createExportSubDir ?? false;

    // If a file with same name exists inside the export dir.
    // Other values: 'err' | 'append' ;
    opts.onDuplicatedNames = opts.onDuplicatedNames ?? 'rename';

    // If an error occurs with one file, what to do.
    opts.onError = opts.onError ?? 'continue'; // 'throw'

    opts.verbose = opts.verbose ?? true;

    opts.inCsvHeader = opts.inCsvHeader ?? 'all';
    opts.inCsvFlatten = !!opts.inCsvFlatten;

    opts.ouCsvtHeader = opts.outCsvHeader ?? 'all';
    opts.outCsvFlatten = !!opts.outCsvFlatten;

    if ('string' === typeof opts.outCsvFlatten) {
        opts.outCsvFlattenByGroup = opts.outCsvFlatten;
    }

    opts.outCsvObjLevel = opts.outCsvObjLevel || 2;

    // Filled-in below.
    let defaultFiles;

    // Type-specific settings.

    if (LOGS) {
        opts.minLog = opts.minLog ?? false;
        opts.maxLog = opts.maxLog ?? false;
        opts.dataDir = opts.dataDir || path.resolve(serverConf.ngDir, 'log');

        defaultFiles = [ 'messages' ];

        opts.incoming = opts.incoming ?? true;
        opts.outgoing = opts.outgoing ?? false;

        if (!opts.incoming && !opts.outgoing) {
            throw new Error(' - err: exports-logs: either incoming or ' +
                            'outgoing must be selected.')
        }

        // Filters.
        opts.setMsgOnly = !!opts.setMsgOnly;
        opts.cleanUp = !!opts.cleanUp;
    }
    else {
        opts.dataDir = opts.dataDir ||
                       path.resolve(serverConf.ngGamesEnabledDir,
                                    opts.game, 'data');

        opts.fromRoom = opts.fromRoom ?? false;
        opts.toRoom = opts.toRoom ?? false;
        opts.rooms = opts.rooms ?? [];

        if (opts.fromRoom || opts.toRoom || opts.rooms.length) {

            // console.log(opts.fromRoom, opts.toRoom, opts.rooms);

            opts.dirFilter = (dir) => {
                // Filter room number.
                let roomNum = dir.split('room')[1];
                roomNum = J.isInt(roomNum);
                // Skip directories not like rooom0000X.
                if (!roomNum) return false;
                if (opts.fromRoom && (roomNum < opts.fromRoom)) return false;
                if (opts.toRoom && (roomNum > opts.toRoom)) return false;
                if (opts.rooms.length && !~opts.rooms.indexOf(roomNum)) {
                    return false;
                }
                return true;
            };
        }

        defaultFiles = [
            'bonus_prolific.csv',
            'bonus.csv',
            'memory.json',
            'memory.csv',
            'data.json',
            'data.csv',
            'times.csv',
            'times_json',
            'player_data.csv',
            'player_data.json'
        ];

        if ('string' === typeof opts.rooms) {
            let tokens = opts.rooms.split(',')
            let out = [];
            tokens.forEach(token => {
                let idx = token.indexOf('-');
                if (!~idx) return out.push(token);
                let l = token.substring(0, idx);
                l = J.isInt(l);
                if (false === l) {
                    console.log('err: invalid room parameter: ' + opts.rooms);
                    return;
                }

                let r = token.substring(idx+1);
                r = J.isInt(r);
                if (false === r) {
                    console.log('err: invalid room parameter: ' + opts.rooms);
                    return;
                }

                J.seq(l, r, 1, t => out.push(t));

            });
            opts.roomsOrig = J.clone(opts.rooms);
            opts.rooms = out;
        }

        if (opts.fromRoom) {
            let f = J.isInt(opts.fromRoom);
            if (false === f) {
                console.log('err: invalid from-room parameter: ' +
                            opts.fromRoom);
                return;
            }
            opts.fromRoom = f;
        }

        if (opts.toRoom) {
            let t = J.isInt(opts.toRoom);
            if (false === t) {
                console.log('err: invalid to-room parameter: ' + opts.toRoom);
                return;
            }
            opts.toRoom = t;
        }
    }


    opts.files = opts.files || defaultFiles;
    if (!Array.isArray(opts.files)) opts.files = [ opts.files ];
    if (opts.filesAdd) opts.files = [ ...opts.files, ... opts.filesAdd ];
};

/**
 * getExportFilename
 *
 * Returns a file name for the exports
 *
 * @param {object} opts Configuration options
 *
 * @return {string} outFile The full path including the filename for the export
 */
const getExportFilename = (serverConf, opts, V) => {

    const OUTDIR_EXPORT = createExportDir(serverConf, opts, V);

    let file = opts.file;

    if (opts.outFormat) {
        let ext = getExtension(file);
        if (ext !== opts.outFormat) file = file += '.' + opts.outFormat;
    }

    let outFile = path.resolve(OUTDIR_EXPORT, file);

    // If file with same name already exists in out directory take action.
    if (fs.existsSync(outFile)) {
        let d = opts.onDuplicatedNames;
        if (d === 'err') {
            throw new Error(`out file already existing: ${outFile}`);
        }
        else if (d === 'rename') {
            let idx = -1;
            for (; ++idx < 100;) {
                outFile = incrementFileIdx(file, idx);
                outFile = path.resolve(OUTDIR_EXPORT, outFile);
                if (!fs.existsSync(outFile)) break;
            }
            if (idx === 100) {
                throw new Error(
                    `max number of files with same suffix in directory` +
                    `reached: ${file}`
                );
            }
        }
        else {
            opts.append = true;
        }
    }

    return outFile;
};

const printOptions = (type, opts) => {
    console.log();
    if (type === 'data') {
        console.log(' *** Exporting data from game: ' + opts.game);
    }
    else {
        // console.log(' *** Exporting logs from : ' + opts.game);
    }
    console.log(' *** Export folder: ' + opts.exportDir);
    if (opts.minRoom) console.log(' *** Min Room: ' + opts.minRoom);
    if (opts.maxRoom) console.log(' *** Max Room: ' + opts.maxRoom);
    if (opts.fromRoom) console.log(' *** From room: ' + opts.fromRoom);
    if (opts.toRoom) console.log(' *** From room: ' + opts.toRoom);
    if (opts.rooms) console.log(' *** Rooms: ' + opts.roomsOrig);

    console.log();

};

const getDefaultExportDir = conf => {
    return path.join(conf.ngDir, 'export');
};

const checkProcessing = cb => {
    setTimeout(() => {
        if (--processing <= 0 && cb) cb();
    }, 1000);
};

const createExportDir = (serverConf, opts, V) => {

    let outDir = opts.exportDir ?? getDefaultExportDir(serverConf);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
        if (V) console.log('- created ' + outDir);
    }

    if (opts.createExportSubDir) {
        // Create dir name based on time.
        let t = new Date().toISOString().replaceAll(':', '-').replace('T', '_');
        t = t.substr(0, t.lastIndexOf('.'));

        outDir = path.join(outDir, t);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir);
            if (V) console.log('- created ' + outDir);
        }
    }

    return outDir;
};

/**
* ### getExtension
*
* Extracts the extension from a file name
*
*
* @param {string} file The filename
*
* @return {string} The extension or NULL if not found
*/
const getExtension = (file) => {
    let format = file.lastIndexOf('.');
    return format < 0 ? null : file.substr(format + 1);
};

/**
* ### incrementFileIdx
*
* Incrementaly adds a suffix to a file name before the extension
*
* @param {string} file The filename
* @param {number} idx Optional. The initial number to increment. Default: 0.
*
* @return {string} The incremented file name.
*/
const incrementFileIdx = (file, idx = 0) => {
    let format = file.lastIndexOf('.');
    if (!~format) return `${file}_${++idx}`;
    return `${file.substr(0, format)}_${++idx}${file.substr(format)}`;
};

module.exports = {
    logs: exportLogs,
    data: exportData,
    getDefaultExportDir: getDefaultExportDir,
    setDefaults: setDefaults
};
