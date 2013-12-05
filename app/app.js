var http = require('http'),
	https = require('https'),
	request = require('request'),
	express = require('express'),
    mongo = require('mongodb'),
    app = express(),
    port = 9300;

// serve static files first
app.use(express.static('public'));

app.listen(port);

console.log( 'Listening on port ' + port + '....');
