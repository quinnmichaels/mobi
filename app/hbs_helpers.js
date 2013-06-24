var hbs = require('handlebars'),
	fs = require('fs');

exports.fieldLabel = function(field) {
	return field.annotation && field.annotation.label ?
		new hbs.SafeString( field.annotation.label ) :
		field.name;
}

exports.fieldEditor = function(field) {
	var editor = 'text';
	if( field.annotation ) {
		if( typeof(field.annotation)==='string' ) editor = field.annotation;
		if( field.annotation.type ) editor = field.annotation.type;
	}
	var templFile = __dirname + '/views/_editors/' + editor + '.hbs';
	// TODO: log warning if editor doesn't exist
	var templ = fs.existsSync( templFile ) ?
		hbs.compile( fs.readFileSync( templFile, 'utf8' ) ) :
		hbs.compile( '<input type="text" value="{{value}}" />' );
	return new hbs.SafeString( templ( field ) );
}