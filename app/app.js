var http = require('http'),
	https = require('https'),
	request = require('request'),
	express = require('express'),
    mongo = require('mongodb'),
	Redmine = require('Redmine'),
    exphbs  = require('../'), // "express3-handlebars"
    hbsHelpers = require('./hbs_helpers'),
    app = express(),
    port = 3000,
    hbs = exphbs.create({
	    defaultLayout: 'main',
		helpers: hbsHelpers,
		extname: '.hbs',
		partialsDir: 'views/_partials/',
		layoutsDir: 'views/_layouts/'
	});

// global function
function escapeJSONString(key, value) {
  if (typeof value == 'string') {
    return value.replace(/[^ -~\b\t\n\f\r"\\]/g, function(a) {
      return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    });
  }
  return value;
}
function JSONStringify(data) {
  return JSON.stringify(data, escapeJSONString).replace(/\\\\u([\da-f]{4}?)/g, '\\u$1');
}

// register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


// get api
app.get('/issue', function(req, res) {
	var key = '3ca22d5c3a4cc0d1281689b76f66e15553531cb0', //request.body.key,
		issueID = 1600, //request.body.issue,
		redmineURL = 'https://popart.plan.io', //request.body.redmineURL,
		options = {
			uri: redmineURL + '/issues/' + issueID + '.json?include=journals',
			json: true,
			headers: {
			  'X-Redmine-API-Key': key
			}
		};
	request(options.uri, options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.end(body);
		} else {
			console.log(response);
		}
	});
});

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
