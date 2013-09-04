var J = require('JSUS').JSUS;
var path = require('path');
var node = require('nodegame-client');
node.setup('nodegame', {});

var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB', {
    dbName: 'facerank_db',
    collectionName: 'facerank_col'
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


mdb.connect(function() {
    var count = 0;
    J.readdirRecursive(DIR, function(err, curFiles) {
        var i, filePath, dir, tmp, player, round, obj;
        // Last line
        if (curFiles === null) {
            var db = mdb.getDbObj();
            var collection = db.collection('facerank_col');

            collection.find().toArray(function(err, data) {
                console.log('data in facerank_col:', data[0]);
                console.log();
                
                mdb.disconnect();
                de = de
            });
            return;
        }
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
            //console.log(obj);
            //console.log(count++)
            mdb.store(obj);
        }
    });
});