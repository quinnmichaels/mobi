var redmine = {
	'key': '3ca22d5c3a4cc0d1281689b76f66e15553531cb0',
	'baseURL': function(str) {
		return 'http://q.dev/mobi/_cfc/mobi.cfc?method=callRedMine&redURL=' + str + '&key=' + redmine.key + '&callback=?';
	},
	'issueURL': function (i) {
		return redmine.baseURL('issues/' + i);
	},
	'loading': function() {
		$('#redmine_issue .data').toggle();
		$('#redmine_issue .loading').toggle();
	},
	'closeIssue': function() {
		$('#redmine_issue').fadeOut('fast', function() {
			$('#redmine_issue .data').html('');
		});
	},
	'issues': function(i) {
		$('#redmine_issue').fadeIn('fast');
		//get issue
		$.ajax({
			url: redmine.issueURL(i),
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



