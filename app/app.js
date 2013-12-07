var http = require('http'),
	https = require('https'),
	path = require('path'),
	express = require('express'),
	exphbs = require('express3-handlebars'),
	request = require('request'),
    mongo = require('mongodb'),
	monk = require('monk'),
	crypto = require('crypto'),
	googleapis = require('googleapis');

var OAuth2Client = googleapis.OAuth2Client,
    db = monk('localhost:27017/mobi'),
    app = express(),
	hbs = exphbs.create({ /* config */ }),
	routes = require('./routes'),
	user = require('./routes/user'),
    port = 9300;

app.enable('view cache');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// build basic site interactions
// validate key
// team stuff
// user stuff

app.get('/userlist', routes.userlist(db));

app.get('/consent', function(req, res) {
	var clientID = '19939366693-mnn18qkhbhon5fiqi30ovs7a0p6gq0ir.apps.googleusercontent.com',
		clientSecret = 'iNGcI4rA-K-aPcKkZWqw2DOp',
		oauth2Client = new OAuth2Client(clientID, clientSecret, 'http://mobi.bleubrain.com/auth'),
		url = oauth2Client.generateAuthUrl({
							access_type: 'offline',
							scope: 'https://www.googleapis.com/auth/plus.me'
						});
	res.redirect(url);
});

app.get('/auth?code=:code', function(res, req) {
	res.send(code);
});

app.get('/enter', function(req, res) {
	function newKey() {
		return crypto.createHash('md5').update(new Date().toString() + Math.floor(Math.random()*1000000).toString()).digest('hex');
	}
	var newKeys = {
		user: newKey(),
		team: newKey()
	};

	res.render('enter', { 	layout: 'main',
							title: 'Express',
							keys: newKeys });
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
app.use(express.static('public'));

app.listen(port);

console.log( 'Listening on port ' + port + '....');


