var redmine = {
	'key': '3ca22d5c3a4cc0d1281689b76f66e15553531cb0',
	'url': 'https://popart.plan.io/',
	'project': '',

	'get': function(url) {
		$.ajax({
			url: url,
			type: 'GET',
			async: false,
			dataType: 'json',
			contentType: 'application/json',
			key: redmine.key,
			success: function() { alert('hello!'); },
			error: function(data, other, another) {
				alert('boo!');
				console.log(data);
			}
		});
  	},

	'issues': {
		'issue': function(id) {
			var issue_url = redmine.url + 'issues/' + id + '.json';
			return redmine.get(issue_url);
		}
	}
}

//redmine.issues.issue(1544);