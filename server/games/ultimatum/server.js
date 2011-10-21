//var options = {
//  host: 'www.google.com',
//  port: 80,
//  path: '/upload',
//  method: 'POST'
//};
//
//var req = require('http').request(options, function(res) {
//  console.log('STATUS: ' + res.statusCode);
//  console.log('HEADERS: ' + JSON.stringify(res.headers));
//  res.setEncoding('utf-8');
//  res.on('data', function(chunk) {
//    console.log('BODY: ' + chunk);
//  });
//});

var io = require('../../../node_modules/socket.io');

var conf = {
		name: "P_" + Math.floor(Math.random()*100),
		url: "http://localhost:8004/admin"
	};

// url 'http://localhost:8004/admin' ?
node.play(conf, new Ultimatum());
