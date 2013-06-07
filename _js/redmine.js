var redmine = {
	'key': '3ca22d5c3a4cc0d1281689b76f66e15553531cb0',
	'url': 'https://popart.plan.io',
	'service_url': 'http://q.dev/mobi/_cfc/mobi.cfc?method=callRedMine&redURL=',
	'users': '',
	'statuses': '',

	'init': function(k, u) {
/*
		this.key = k;
		this.url = u;
*/

		this.getUsers();
		this.getStatuses();
	},

	'callURL': function(str) {
		return this.service_url + this.url + str + '&key=' + this.key + '&callback=?';
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
		$.ajax({
			url: redmine.callURL('/issues/' + i + '.json?include=journals'),
			async: false,
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: function() {
				redmine.loading();
			},
			success: function(data) {
				redmine.loading()
				var d = data.issue,
				 	j_html = '',
				 	cur_out = '';
				 console.log(data);

				loadTemplate('#redmine_issue', 'issue', data);
			},
			error: function(a, b, c) {
				this.err();
			}
		});
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
				this.err();
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