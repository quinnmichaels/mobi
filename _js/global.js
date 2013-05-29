"use strict"
// global variables
var window_timer = 0;

function toggleMenu() {
	var offset = 0,
		$height = $('#mobi_menu').height() + offset,
		$pos = Math.abs(parseFloat($('#panel').css('bottom'))),
		nextPos = $pos == 0 ? '-' + $height + 'px' : 0;
	$('#panel').animate({
	    bottom: nextPos
	});
}

function viewRotate() {
	var $iframe = $('#iframe_view'),
	frameW = $iframe.css('width'),
	frameH = $iframe.css('height');

	$iframe.animate({
		width: frameH,
		height: frameW
	});
}
//! storage
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

//! timer
var timer = {
	'cur': '',
	'idx': 0,
	'tmr':{
		'hr': 0,
		'min': 0,
		'sec': 0
	},
	'init': function() {},
	'get': function() {
		return storage.get(mobi.site)['cards'][timer.idx].timer;
	},

	'set': function() {
		var s = mobi.sites.get();
		s['cards'][timer.idx].timer = timer.tmr;
		storage.set(mobi.site, s);

	},

	'start_stop': function(id) {

		var sym = '&plus;',
			$this = $('#'+id+' .start_stop');

		timer.tmr = timer.get();

		$this.toggleClass('stop').toggleClass('start');

		if ($this.hasClass('stop')) {
			timer.cur = id;
			timer.idx = parseFloat(id);
			timer.start();
			sym = '&times;';
		} else {
			timer.stop();
		}

		$this.html(sym);
	},

	'start': function() {
		var $timer = $('#' + this.cur + ' > input'),
			t_hr = timer.tmr.hr ? this.tmr.hr + ':' : '00:',
			t_min = timer.tmr.min ? this.tmr.min + ':' : '00:',
			t_sec = timer.tmr.sec ? this.tmr.sec : '00';

			t_hr = parseFloat(t_hr) > 0 && parseFloat(t_hr) < 10 ? '0' + t_hr : t_hr;
			t_min = parseFloat(t_min) > 0 && parseFloat(t_min) < 10 ? '0' + t_min : t_min;
			t_sec = parseFloat(t_sec) > 0 && parseFloat(t_sec) < 10 ? '0' + t_sec : t_sec;

		this.tmr.sec++;
		if (this.tmr.sec == 60) {
			this.tmr.sec = 0;
			this.tmr.min++;
		}
		if (this.tmr.min == 60) {
			this.tmr.min = 0;
			this.tmr.hr++
		}

		timer.set();
		$timer.val( t_hr + t_min + t_sec );
		window_timer = setTimeout('timer.start()', 1*1000);

	},
	'stop': function() {
		window.clearTimeout(window_timer);
	},
	'reset': function() {

	}

}

//! cards
var cards = {
	'init': function() {
		var $drag;
		cards.list();

		$('button[data-action="delete"]').on('click', cards.delete);

		$('#mobi_menu_container ol').sortable({
			revert: true,
			start: function(e,ui) {
				$drag = $('#' + ui.item[0].id);
				$drag.addClass('dragging');
			},
			stop: function() {
				$drag.removeClass('dragging');
				cards.cardSort();
			}
		});
		$('.card_options_menu').on('click', function() {
			var $height = $(this).height() - 18,
				$pos = Math.abs(parseFloat($(this).css('bottom'))),
				nextPos = $pos == 0 ? '-' + $height + 'px' : 0;
			$(this).animate({
			    bottom: nextPos
			});

		});
		$('#mobi_menu_container ol,#mobi_menu_container li').disableSelection();

		return false;
	},

	'cardBlank': function() {
		return {'title':'','page':'', 'status':'','desc':''};
	},

	'cardScroll': function(e, ui) {
		var id = this.id,
			$card_box = $('#mobi_menu_cards').width(),
			$cards = $('#mobi_menu_cards ol'),
			pos = $cards.scrollLeft(),
			wid = $cards.width(),
			jump = 411,
			can_jump = false,
			animate_to;

			switch (id) {
				case 'cards_scroll_l':
					animate_to = Math.abs(pos) - jump;
					break;
				case 'cards_scroll_r':
					animate_to = Math.abs(pos + jump);
					break;
			}
			$cards.animate({
				scrollLeft: animate_to
			})
	},

	'cardSort': function(e,u) {
		var new_arr = [],
			the_cards = mobi.sites.get()['cards'];

		$('#mobi_menu_container ol li').each(function() {
			new_arr.push(the_cards[parseFloat(this.id)]);
		});
		the_cards = new_arr;
//		storage.set('cards', the_cards);
	},

	'cardHTML': function(c, id) {
		var card_menu = '<div class="card_options_menu" onclick=""><div class="card_options_button"></div><div class="card_options">';
			card_menu += '<button data-action="archive" data-id="'+id+'">archive</button>';
			card_menu += '<button data-action="delete" data-id="'+id+'">delete</button>';
			card_menu += '</div></div>';

		var card_timer = '<div id="' + id + '-timer" class="timer">';
			card_timer += '<button class="start_stop start" onclick="timer.start_stop(\''+id+'-timer\')">&plus;</button>';
			card_timer += '<button class="reset">&oplus;</button>';
			card_timer += '<input type="text" name="timer" placeholder="00:00:00" value="" readonly="readonly">';
			card_timer += '</div>';

		var	card_out = card_menu;
			card_out += '<input type="text" name="title" placeholder="title" value="' + c.title + '">';
			card_out += card_timer;
			card_out += '<label for="page">page</label><input type="text" name="page" placeholder="*.html" value="' + c.page + '">';
			card_out += '<textarea name="desc" placeholder="notes">' + c.desc + '</textarea>';
			card_out = '<li class="card" id="' + id + '"><div>' + card_out + '</div></li>';
		return card_out;
	},

	'list': function() {
		var card_list = mobi.sites.get()['cards'],
			ret = '';

		for (var x in card_list) {
			if (card_list[x] != null) {
				ret += this.cardHTML(card_list[x], x + '-card');
			}
		}
		$('#mobi_menu_container ol').html(ret);
	},

	'create': function(e) {
		var n_state,
			$state = $('#add_card').attr('data-state'),
			$mobi_menu = $('#mobi_menu_container ol'),
			new_card = cards.cardHTML(cards.cardBlank(), 'new_card');

		switch ($state) {
			case 'add':
				n_state = 'close';
				$('#add_card').html('&times;');

				$mobi_menu.append(new_card);

				$('#new_card > div').fadeIn({
					duration: 200,
					complete: function() {
						$('#new_card input[name="title"]').focus();
					}
				});
				break;

			case 'close':
				n_state = 'add';
				$('#add_card').html('&plus;');
				$('#new_card').hide().remove();
				break;
		}

		$('#add_card').attr('data-state', n_state);

	},

	'add': function(new_card) {
		var s = mobi.sites.get(),
			c = s['cards'];

		c.push(new_card);

		s['cards'] = c;
		storage.set(mobi.site, s);
	},

	'save': function() {
		var save_card = {
	    	'title': $('#new_card [name="title"]').val(),
	    	'page': $('#new_card [name="page"]').val(),
	    	'status': $('#new_card [name="status"]').val(),
	    	'desc': $('#new_card [name="desc"]').val(),
	    	'timer': {'hr':0, 'min':0, 'sec':0},
	    	'ticket': 0
		}

	    if (save_card.title) {
		    this.add(save_card);
			this.create();
			this.list();
//			$('#mobi_menu_container ol').append(cards.cardHTML(getCard, cardID));
	    }
	},

	'delete': function(e) {
		var all_cards = storage.get('cards'),
			$id = $(this).data('id');

			all_cards[mobi.site].splice(parseFloat($id), 1);
//			storage.set('cards', all_cards);
			$('#' + $id).hide(175, function() {
				$(this).remove();
			});
/*

		all_cards[mobi.site] = all_cards[mobi.site];


		console.log(all_cards[mobi.site]);

*/
	}

};

//! mobi
var mobi = {
	'init': function() {
		mobi.site = $('#iframe_view').attr('src');
		this.history.init();
		this.devices.display();
		this.sites.init();
		cards.init();
	},

	'site': '',

	'sites': {
		'init': function() {
			this.set(mobi.site);
			cards.list();
		},
		'get': function() {
			return storage.get(mobi.site);
		},
		'set': function(si) {
			var new_site = {
					'url': si,
					'title': si,
					'desc': si,
					'cards': [],
					'settings': {}
				};

			if (!storage.check(si)) {
				storage.set(si, new_site);
			}
		}
	},

	'devices': {
		'list': {
			'fullscreen': {
				'width': '100%',
				'height': '100%'
			},
			'desktop': {
				'width': 	'1600px',
				'height': 	'850px'
			},
			'ipad': {
				'width': 	'1024px',
				'height': 	'768px'
			},
			'iphone5': {
				'width': 	'320px',
				'height': 	'568px'
			},
			'iphone4': {
				'width': 	'320px',
				'height': 	'480px'
			},
			'galaxy': {
				'width': 	'360px',
				'height':	'640px'
			},
			'droidtab': {
				'width': 	'1280px',
				'height': 	'800px'
			}
		},

		'active': function(a) {

			$('#devices ul li').removeClass('active');
			$('#' + a).attr('class','active');

	    	storage.set('view', a);
		},

		'display': function() {

			var deviceLI = '',
				dList = mobi.devices['list'];

			for (var x in dList) {
				deviceLI += '<li id="' + x + '" class=""><div class="' + x + '">' + x + '</div></li>';
			}
			$('#devices ul').html(deviceLI);

		},

		'view': function(id) {
	    	this.active(id);
	    	var cur_view = this.list[id],
	    		$con = $('.content_container');

			if (id == 'fullscreen') {
				$con.addClass('fullscreen');
			} else {
				$con.removeClass('fullscreen');
			}


	    	$('#iframe_view').animate({
	    		width: cur_view.width,
	    		height: cur_view.height
			});
		}
	},


	'history': {
		'init': function() {
			var hist = this.get(),
				last_hist = hist[hist.length-1];

			//create url history object in local storage
			if (!storage.check('url_history')) {
				storage.set('url_history', []);
			} else {
				$('#iframe_view').attr('src', 'http://' + last_hist);
				$('#url_input').val(last_hist);
			}

			mobi.site = $('#url_input').val();
			this.list();
		},

		'set': function(url) {
			var new_history = storage.get('url_history'),
				in_index = new_history.indexOf('url');

			new_history.push(url);
			storage.set('url_history', new_history);
		},

		'get': function() {
			var stor = storage.get('url_history');

			if (!stor) {
				stor = [];
				storage.set('url_history', stor);
			}
			return stor;
		},

		'list': function() {
			var get_history = storage.get('url_history'),
				get_html = '';

			get_history.reverse();

			for (var x in get_history) {
				get_html += '<li><a href="#" class="history_url" data-url="' + get_history[x] + '">' + get_history[x] + '</a></li>';
			}
			$('#history_menu ul').html(get_html);
		}
	},
	'go': function(url) {
		mobi.site = url;
		mobi.history.set(url);
		mobi.sites.init();

		$('#url_input').blur();
		$('#iframe_view').attr('src', 'http://' + url);
	},

	'refresh': function() {
	    this.go(mobi.site);
	}
};

//! document ready
$(function() {

	$(document).keypress(function(e) {
		function vdev(d) {
			mobi.devices.view(d);
		}
		switch (e.which) {
			case 8710: //alt/opt + j to toggle menu
				toggleMenu();
				break;
			case 730: // alt/opt + k create a new card;
				var panel_pos = Math.abs(parseFloat($('#panel').css('bottom')));
				if (panel_pos) {
					toggleMenu();
				}
				cards.create();
				break;

			case 13:  // return/enter to save card
				if (e.target.parentNode.offsetParent.id == 'new_card') {
					cards.save();
				}
				break;
			case 186:
				vdev('fullscreen');
				break;
			case 161: // alt/opt + 1
				vdev('desktop');
				break;
			case 8482: // alt/opt + 2
				vdev('ipad');
				break;
			case 163: // alt/opt + 3
				vdev('iphone5');
				break;
			case 162: // alt/opt + 4
				vdev('iphone4');
				break;
			case 8734: // alt/opt + 5 samsung galaxy
				vdev('galaxy');
				break;
			case 167: // alt/opt + 6 android tab
				vdev('droidtab');
				break;
			case 171:
				viewRotate();
				break;
		}
	});



	//draggable stuff
	$('#modal').draggable();

	var $i = $('#iframe_view');

    if (!storage.check('view')) {
	    mobi.devices.view('fullscreen');
    } else {
		$i.attr('class', storage.get('view'));
		mobi.devices.active(storage.get('view'));
    }

    $('#rotate_iframe').on('click', function() {
	    viewRotate();
    });

    $('#frame_reload').on('click', function(e) {
    	e.preventDefault();
    	mobi.refresh();
    });


    $('#menu_button').on('click', toggleMenu);

    $('#url_form').submit(function(e) {
	   e.preventDefault();
	   var go_url = $('#url_input').val();
	   mobi.go(go_url);
	   cards.list();
    });


    $('#frame_history').on('click', function(e) {
		e.preventDefault();
		$('#history_menu').fadeToggle();
    });

    $('.history_url').on('click', function(e) {
		e.preventDefault();
		$('#history_menu').fadeToggle();
		mobi.go($(this).data('url'));
    });


    $('#add_card').on('click', cards.create);

    $('#devices ul li div').on('click', function(e) {
	    e.preventDefault();
	    mobi.devices.view(this.id);
    });

//    $('.timer .start_stop').on('click', timer.start_stop);
    $('.card_scroll').on('click', cards.cardScroll);

	mobi.init();
});