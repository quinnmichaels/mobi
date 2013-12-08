var http = require('http'),
	https = require('https'),
	path = require('path'),
	express = require('express'),
	exphbs = require('express3-handlebars'),
	request = require('request'),
	googleapis = require('googleapis')
	mongo = require('mongodb'),
	monk = require('monk');

var OAuth2Client = googleapis.OAuth2Client,
    db = monk('localhost:27017/mobi'),
    app = express(),
	hbs = exphbs.create({}),
	routes = require('./routes'),
	user = require('./routes/user'),
	lib = require('./lib/lib.js'),
    port = 9300;

var clientID = '19939366693-mnn18qkhbhon5fiqi30ovs7a0p6gq0ir.apps.googleusercontent.com',
	clientSecret = 'iNGcI4rA-K-aPcKkZWqw2DOp';


app.enable('view cache');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// build basic site interactions
// validate key
// team stuff
// user stuff

app.get('/', function(req,res) {
	res.redirect('/enter');
});

app.get('/userlist', routes.userlist(db));


//! /auth --- in progress
app.get('/auth', lib.newuser(db));


//! /enter --- in progress
app.get('/enter', function(req, res) {
	var	oauth2Client = new OAuth2Client(clientID, clientSecret, 'http://mobi.bleubrain.com/auth'),
		url = oauth2Client.generateAuthUrl({
							access_type: 'offline',
							scope: 'https://www.googleapis.com/auth/plus.me'
						});

	res.render('enter', {layout: 'main',
		title: 'Get Ready',
		gurl: url
	});
});

// sync stuff

app.get('/sites', function(req, res) {
	request('http://www.google.com', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body) // Print the google web page.
			res.end(body);
		}
	})
});

// serve static files first
app.use('/app', express.static('public'));

app.listen(port);

console.log( 'Listening on port ' + port + '....');


