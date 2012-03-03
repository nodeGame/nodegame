/**
 * Start File for nodeGame server with conf.
 */

var ServerNode = require('nodegame-server');

var options = {
    name: "nodeGame Server",
    port: 8080,
    verbosity: 0,
    dumpsys: false,
    dumpmsg: true,
    mail: false,
    io: { 
        set: {
            transports: ['websocket'],
            'log level': -1
        }
    },
    http: {}
};



// ServerNode accepts two additional parameters:
// - an instance of an http Express server
// - an instance of socket.io
// If not passed, they will be created with default settings
var sn = new ServerNode(options);

sn.addChannel({
    name: '2',
    admin: 'ultimatum2/admin',
    player: 'ultimatum2'
});

sn.addChannel({
    name: 'pr',
    admin: 'pr/admin',
    player: 'pr'
});