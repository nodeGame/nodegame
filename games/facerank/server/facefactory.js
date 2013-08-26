function FaceFactory(node, idx, file) {
    
    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);

    this.mdb = ngdb.getLayer('MongoDB');
}

FaceFactory.prototype.getNextFace = function() {
    
};

mdb.connect(function() {
    console.log('Connected');

    var db = mdb.getDbObj();
    var collection = db.collection('facerank');
    
    mdb.disconnect();
});
