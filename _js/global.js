"use strict"
/**********************************
 !local storage
***********************************/
// check local storage value
var mobi = {
	'init': function() {
		//create url history object in local storage
		if (!storage.check('url_history')) {
			storage.set('url_history', []);
		} else {
			$('#iframe_view').attr('src', this.history.get()[0]);
			console.log(this.history.get()[0]);
		}
		this.history.list();
	},

	'history': {
		'set': function(url) {
			var new_history = storage.get('url_history'),
				in_index = new_history.indexOf('url');

			console.log(in_index);
			new_history.push(url);
			storage.set('url_history', new_history);
		},

		'get': function() {
			return storage.get('url_history');
		},

		'list': function() {
			var get_history = storage.get('url_history'),
				get_html = '';

			get_history.reverse();

			for (var x in get_history) {
				get_html += '<li><a href="#" class="history_url" data-url="' + get_history[x] + '">' + get_history[x] + '</a></li>';
			}
			$('#history_panel ul').html(get_html);
		}
	},
	'go': function(url) {
		var $frame = $('#iframe_view');

		$('#url_input').val(url);
		$frame.attr('src', url);
		this.history.set(url);
		this.history.list();
	},

	'refresh': function() {
	    this.go($('#iframe_view').attr('src'));
	}
};


var storage = {

	'check': function(key) {
		return localStorage[key] ? true : false;
	},
	'set': function(key, keyval) {
		localStorage.setItem(key, JSON.stringify(keyval));
	},
	'get': function(key){
		return JSON.parse(localStorage.getItem(key));
	},
	'delete': function(key) {
		localStorage.removeItem(key);
	}
};


var activeButton = function(a) {
	$('.buttons a').removeClass('active');
	$('#' + a).attr('class','active');
}

$(function() {
	mobi.init()

	var $i = $('#iframe_view');

    if (!storage.check('view')) {
	    storage.set('view', 'desktop');
	    $i.attr('class', 'desktop');
    } else {
		$i.attr('class', storage.get('view'));
		activeButton(storage.get('view'));
    }

    $('.buttons a').on('click', function(e) {
    	e.preventDefault();
    	activeButton(this.id);

    	storage.set('view', this.id);
    	$i.attr('class', this.id);
    });

    $('#frame_reload').on('click', function(e) {
    	e.preventDefault();
    	mobi.refresh();
    });

    $('#url_form').submit(function(e) {
	   e.preventDefault();
	   var go_url = $('#url_input').val();
	   mobi.go(go_url);
    });


    $('#frame_history').on('click', function(e) {
		e.preventDefault();
		$('#history_panel').fadeToggle();
    });

    $('.history_url').on('click', function(e) {
		e.preventDefault();
		$('#history_panel').fadeToggle();
		mobi.go($(this).data('url'));
    });
})
