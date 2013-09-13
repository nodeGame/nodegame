var J = require('JSUS').JSUS;
var path = require('path');
var NDDB = require('NDDB').NDDB;
var ngc = require('nodegame-client');
var node = ngc.getClient();
node.setup('nodegame', {});

var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB', {
    dbName: 'facerank_db',
    collectionName: 'facerank_sets_ordered'
});

var DIR = path.resolve(__dirname, '../faces');

var sessions = {
    // 25 JAN 2013
    'com_rand_25_jan_2013': {
        date: '25-01-2013',
        after: 0,
        morn: 1,
        id: 1
    },
    'com_choice_25_jan_2013': {
        date: '25-01-2013',
        after: 1,
        morn: 0,
        id: 2
    },
    // 30 JAN 2013
    'coo_rand_30_jan_2013': {
        date: '30-01-2013',
        after: 0,
        morn: 1,
        id: 3
    },
    'coo_choice_30_jan_2013': {
        date: '30-01-2013',
        after: 1,
        morn: 0,
        id: 4
    },
    // 31 JAN 2013
    'com_choice_31_jan_2013': {
        date: '31-01-2013',
        after: 0,
        morn: 1,
        id: 5
    },
    'coo_rand_31_jan_2013': {
        date: '31-01-2013',
        after: 1,
        morn: 0,
        id: 6
    },
    // 1 FEB 2013
    'com_rand_1_feb_2013': {
        date: '01-02-2013',
        after: 1,
        morn: 0,
        id: 7
    },
    'coo_choice_1_feb_2013': {
        date: '01-02-2013',
        after: 0,
        morn: 1,
        id: 8
    },
    // 4 FEB 2013
    'com_rand_4_feb_2013': {
        date: '04-02-2013',
        after: 1,
        morn: 0,
        id: 9
    },
    'coo_rand_4_feb_2013': {
        date: '04-02-2013',
        after: 0,
        morn: 1,
        id: 10
    },
    // 6 FEB 2013
    'coo_choice_6_feb_2013': {
        date: '06-02-2013',
        after: 0,
        morn: 1,
        id: 11
    },
    'com_choice_6_feb_2013': {
        date: '06-02-2013',
        after: 1,
        morn: 0,
        id: 12
    },
    // 7 FEB 2013
    'com_rand_7_feb_2013': {
        date: '07-02-2013',
        after: 0,
        morn: 1,
        id: 13
    },
    'coo_rand_7_feb_2013': {
        date: '07-02-2013',
        after: 1,
        morn: 0,
        id: 14

    },
    // 8 FEB 2013
    'com_choice_8_feb_2013': {
        date: '08-02-2013',
        after: 0,
        morn: 1,
        id: 15
    },
    'coo_choice_8_feb_2013': {
        date: '08-02-2013',
        after: 1,
        morn: 0,
        id: 16
    }
};

var nddb = new NDDB({
    update: { indexes: true }
});
nddb.hash('ps', function(o) {
    return o.id + '_' + o.player;
});

var dbSets = new NDDB()

mdb.connect(function() {
    
    // Total count of files in all directories.
    var count = 0;
    // Opens all directories of images (1 dir per session)
    J.readdirRecursive(DIR, function(err, curFiles) {
        var i, filePath, dir, tmp, player, round, obj;
        // All files opened.
        if (curFiles === null) {
            var ps, newObj, newCount;
            newCount = 0;
            // Creates a single obj out of every hash (session-player)
            // The obj (newObj) contains general data (session, player, etc)
            // and a new field called items that contains all the pictures
            // made by that player sorted by round.
            for ( ps in nddb.ps) {
                if (nddb.ps.hasOwnProperty(ps)) {
                    nddb.ps[ps].sort(function(o1, o2) {                      
                        if (o1.id < o2.id) return -1;
                        else if (o2.id < o1.id) return 1;
                        if (o1.player < o2.player) return -1;
                        else if (o2.player < o1.player) return 1;
                        if (o1.round < o2.round) return -1;
                        else if (o2.round < o1.round) return 1;
                        return 0;
                    });
                    newObj = J.clone(nddb.ps[ps].first());
                    delete newObj.file;
                    delete newObj.path;
                    newObj.count = ++newCount;
                    newObj.items = nddb.ps[ps].fetchSubObj(['round', 'file', 'path']);

                    // Storing the entry with ordered pictures of a player
                    mdb.store(newObj);
                }
            }
            
            // Display data in collection and close db connection.
            var db = mdb.getDbObj();
            var collection = db.collection('facerank_sets_ordered');
            collection.find().toArray(function(err, data) {
                console.log('data in facerank_col:', data[0]);
                console.log();

                mdb.disconnect();
            });
            return;
        }
        
        // For every file in set (full Dir or subset of dir)
        // creates an object
        for (i = 0; i < curFiles.length; i++) {
            filePath = curFiles[i];
            tmp = filePath.split('/');
            dir = tmp[0];
            file = tmp[1];
            if (tmp.length !== 2) return;
            tmp = file.substring(0, file.length-4).split('_');
            player = parseInt(tmp[0], 10);
            round = parseInt(tmp[1], 10);
            obj = J.merge(sessions[dir], {
                count: ++count,
                dir: dir,
                file: file,
                path: filePath,
                player: player,
                round: round
            });
            
            // Save into NDDB to reuse it later.
            nddb.insert(obj);
            
            // Uncomment here to store every single picture
            //mdb.store(obj);
        }
    });
});