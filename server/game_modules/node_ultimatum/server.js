var io = 
var conf = {
		name: "P_" + Math.floor(Math.random()*100),
		url: "http://localhost:8004/admin"
	};

// url 'http://localhost:8004/admin' ?
node.play(conf, new Ultimatum());
