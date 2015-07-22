var express = require('express');
var path = require('path');
var app = express();
var handleRequest = require('./request-handler-2');

var ip = '127.0.0.1';
var port = 3000;

app.listen(port);
console.log("Listening on http://" + ip + ":" + port);

app.use( express.static( path.join(__dirname,'../client') ) );

app.get('/', function(req,res) {
	res.sendFile( path.join(__dirname,'../client/index.html') );
});

app.get('/classes/messages',handleRequest.getMessages);

app.post('/classes/messages',handleRequest.writeMessage);

app.use(function(req,res) {
	res.status(404).send('404');
});
