var redmine = {
	'key': '3ca22d5c3a4cc0d1281689b76f66e15553531cb0',
	'url': 'https://popart.plan.io',
	'service_url': 'http://q.dev:9000/issue/',
	'users': '',
	'statuses': '',
	'issue': '',

	'init': function(k, u) {
/*
		this.key = k;
		this.url = u;
*/

	},

	'callURL': function(str) {
		return this.service_url + str + '?red=' + this.url + '&key=' + this.key;
	},

	'loading': function() {
		$('#redmine_issue').fadeIn();
	},
	'err': function() {
		modal.err('there was an error placing your call. please try again');
	},
	'close': function() {
		$('#redmine_issue').fadeOut('fast', function() {
			$('#redmine_issue').html('');
		});
	},

	'issue': function(i) {
		$('#redmine_issue').fadeIn('fast');
		//get issue
		this.getUsers();
		this.getStatuses();

		$.getJSON(redmine.callURL(i), function(data) {
			loadTemplate('#redmine_issue', 'issue', data);
		});
	},

	'issueDesc': function(i) {
		console.log(i);
	},

	'issueNote': function() {
		$('.update-issue form').slideToggle();
	},

	'getUsers': function() {
		//get users
		$.ajax({
			url: redmine.callURL('/users.json'),
			async: false,
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				redmine.users = data.users;
				return true;
			},
			error: function(a, b, c) {
				redmine.err();
			}
		});
	},
	'getStatuses': function() {
		//get users
		$.ajax({
			url: redmine.callURL('/issue_statuses.json'),
			async: false,
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				redmine.statuses = data.issue_statuses;
				return true;
			},
			error: function(a, b, c) {
				redmine.err();
			}
		});
	},
	'update': function(id) {

		issueData = {
			'issue': {
				'assigned_to_id': $('#redUsers').val(),
				'status_id': $('#redStatus').val(),
				'notes': $('#redNotes').val()
			}
		};
/*
	    $.ajax({
	        type: 'get',
	        crossDomain: true,
	        url: redmine.callURL('/issues/'+id+'.json?data=' + JSON.stringify(issueData)),
	        async: false,
	        contentType: 'application/json',
	        beforeSend: function(xhr) {
	            xhr.setRequestHeader('X-Redmine-API-Key', redmine.key);
	            console.log('send key');
	        },
	        success: function(data) {
	            console.log('success');
		        console.log(data);
	        },
	        error: function(xhr, msg, error) {
	        	console.log('fail');
	        	console.log(error);
				redmine.err();
	        }
	     });
*/

	}

}