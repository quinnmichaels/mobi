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
		$('#redmine_issue .data').toggle();
		$('#redmine_issue .loading').toggle();
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
				$('#redmine_issue .subject').html(d.subject);
				$('#redmine_issue .author').html(d.author.name);
				$('#redmine_issue .assigned_to').html(d.assigned_to.name);
				$('#redmine_issue .created').html(d.created_on);
				$('#redmine_issue .status').html(d.status.name);
				$('#redmine_issue .tracker').html(d.tracker.name);
				$('#redmine_issue .description').html(d.description);

				for (var x in d.journals) {
					var cur = d.journals[x];
					cur_out += '<div class="journal_item">';
					cur_out += '<h1>'+ cur.user.name + '</h1>';
					cur_out += '<h2>'+ cur.created_on + '</h2>';
					cur_out += '<p>'+ cur.notes + '</p>';
					cur_out += '</div>';
				}
				$('#redmine_issue .journal').html(cur_out);
			},
			error: function(a, b, c) {
				modal.err('there was an error placing your call. please try again');
			}
		});

		//get issue statuses

	}
}



