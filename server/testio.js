var io = require('socket.io');
var util = require('util');



var a = function adminServer() {
			this.server = io;
			util.inspect(io);
			console.log('------------');
			console.log(io);
			console.log('------------');
			this.server.listen(8081);
			console.log(this.server);
		}();
		
		
util.inspect(io);		