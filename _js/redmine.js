var redmine = {
	'key': '3ca22d5c3a4cc0d1281689b76f66e15553531cb0',
	'url': 'https://popart.plan.io',
	'service_url': 'http://q.dev/mobi/_cfc/mobi.cfc?method=callRedMine&redURL=',

	'init': function(k, u) {
		this.key = k;
		this.url = u;
	},

	'callURL': function(str) {
		return this.service_url + this.url + str + '&key=' + this.key + '&callback=?';
	},

	'loading': function() {
		$('#redmine_issue').fadeIn();
	},

	'close': function() {
		$('#redmine_issue').fadeOut('fast', function() {
			$('#redmine_issue .data').html('');
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
				console.log(data);
				redmine.loading()
				var d = data.issue,
				 	j_html = '',
				 	cur_out = '';
				 console.log(data);

				loadTemplate('#redmine_issue', 'issue', data);
			},
			error: function(a, b, c) {
				modal.err('there was an error placing your call. please try again');
			}
		});

		//get issue statuses

	}
}



