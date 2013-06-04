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

var loadTemplate = function(id, tmp, tmpData, _tmpType) {
	var source,
		template,
		path = '_hbs/' + tmp + '.hbs',
		$i = $(id);

	$.ajax({
		url: path,
		cache: true,
		success: function (data) {
			source = data;
			template = Handlebars.compile(source),
			$i = $(id);
			switch (_tmpType) {
				case 'append':
					$i.append(template(tmpData));
					break;
				case 'prepend':
					$i.prepend(template(tmpData));
					break;
				default:
					$i.html(template(tmpData));
					break;
			}
		}
	});
}



//! timer
var timer = {
	'cur': '',
	'idx': 0,
	'tmr': {hr:0, min: 0, sec: 0},
	'init': function() {},
	'get': function() {
		var tmr = mobi.sites.get()['cards'][timer.idx].timer;
		timer.tmr = tmr;
	},

	'set': function() {
		var s = mobi.sites.get();
		s['cards'][timer.idx].timer = timer.tmr;
		storage.set(mobi.site, s);
	},

	'start_stop': function(id) {

		var sym = '&plus;',
			$this = $('#'+id+' .start_stop');

		if ($this.hasClass('start')) {
			timer.cur = id;
			timer.idx = parseFloat(id);
			timer.get();
			timer.start();
			sym = '&times;';
		} else {
			timer.stop();
		}

		$this.toggleClass('start').toggleClass('stop').html(sym);
	},

	'start': function() {
		var $timer = $('#' + this.cur + ' > input'),
			t_hr = timer.tmr.hr ? this.tmr.hr + ':' : '00:',
			t_min = timer.tmr.min ? this.tmr.min + ':' : '00:',
			t_sec = timer.tmr.sec ? this.tmr.sec : '00';

			t_hr = parseFloat(t_hr) > 0 && parseFloat(t_hr) < 10 ? '0' + t_hr : t_hr;
			t_min = parseFloat(t_min) > 0 && parseFloat(t_min) < 10 ? '0' + t_min : t_min;
			t_sec = parseFloat(t_sec) > 0 && parseFloat(t_sec) < 10 ? '0' + t_sec : t_sec;

		timer.tmr.sec++;
		if (timer.tmr.sec == 60) {
			timer.tmr.sec = 0;
			timer.tmr.min++;
		}
		if (timer.tmr.min == 60) {
			timer.tmr.min = 0;
			timer.tmr.hr++
		}

		$timer.val( t_hr + t_min + t_sec );
		window_timer = setTimeout('timer.start()', 1*1000);
	},
	'stop': function() {
		timer.set();
		window.clearTimeout(window_timer);
	},
	'reset': function() {

	}

}

//! cards
var cards = {
	'init': function() {
		var $drag;
		this.list();

		$('button[data-action="delete"]').on('click', cards.delete);

		//! draggable cads
		$('#card_list').sortable({
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

		//! card options menu
		$('.card_options_menu').on('click', function() {
			var $height = $(this).height() - 18,
				$pos = Math.abs(parseFloat($(this).css('bottom'))),
				nextPos = $pos == 0 ? '-' + $height + 'px' : 0;
			$(this).animate({
			    bottom: nextPos
			});

		});
		$('#card_list,#card_list li').disableSelection();
	},

	'cardBlank': function() {
		return {'title':'','page':'', 'issue':'', 'status':'','desc':''};
	},

	'cardScroll': function(e, ui) {
		var id = this.id,
			$card_box = $('#mobi_menu_cards').width(),
			$cards = $('#card_list'),
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
			s = mobi.sites.get();

		$('#card_list li').each(function() {
			new_arr.push(s['cards'][parseFloat(this.id)]);
		});
		s['cards'] = new_arr;
		storage.set(mobi.site, s);
	},

	'get': function() {
		return mobi.sites.get()['cards'];
	},

	'list': function() {
		console.log(mobi.sites.get());
		loadTemplate('#card_list', 'card', mobi.sites.get());

/*
		for (var x in c) {
			if (c[x] != null) {
				ret += this.cardHTML(c[x], x + '-card');
			}
		}
		$('#mobi_menu_container ol').html(ret);
*/
	},

	'create': function(e) {
		var n_state,
			$state = $('#add_card').attr('data-state'),
			$mobi_menu = $('#card_list'),
			new_card;

		switch ($state) {
			case 'add':
				n_state = 'close';

				$('#add_card').html('&times;');

				loadTemplate('#card_list', 'card-form', cards.cardBlank(), 'append');
				$('#card_form input[name="title"]').focus();
				break;

			case 'close':
				n_state = 'add';
				$('#add_card').html('&plus;');
				$('#card_form').parent().fadeOut().remove();
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
	    	'title': $('#card_form [name="title"]').val(),
	    	'page': $('#card_form [name="page"]').val(),
	    	'status': $('#card_form [name="status"]').val(),
	    	'desc': $('#card_form [name="desc"]').val(),
	    	'issue': $('#card_form [name="issue"]').val(),
	    	'timer': {'hr':0, 'min':0, 'sec':0}
		}

		if (save_card.title) {
		    this.add(save_card);
			this.create();
			this.list();
//			$('#mobi_menu_container ol').append(cards.cardHTML(getCard, cardID));
	    }
	},

	'delete': function(idx) {
		var s = mobi.sites.get(),
			$id = $('#'+idx+'-card');

		s['cards'].splice(idx, 1);
		storage.set(mobi.site, s);
		$id.hide(175, function() {
			$id.remove();
		});
	}

};

//! mobi
var mobi = {
	'init': function() {
		mobi.site = $('#iframe_view').attr('src');
		mobi.sites.init();
		mobi.devices.display();
		mobi.devices.view(mobi.devices.get());
		mobi.history.init();
		cards.init();
		//! load init templates into app
		loadTemplate('#settings_panel', 'settings', mobi.sites.get()['settings']);
	},

	'site': '',

	'sites': {
		'init': function() {
			this.set(mobi.site);
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
					'settings': {
						'red_url': '',
						'red_key':''
					}
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
		'get': function() {
			var v = storage.get('view');
			if (!v) {
				v = 'fullscreen';

			}
			return v;
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
		'view': function(_id) {
			var id = _id;
			if (!id) {
			 storage.set('view', 'fullscreen');
			}
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

	//! history
	'history': {
		'init': function() {
			var stor = storage.get('url_history'),
				new_stor = {'urls': []};
				new_stor.urls.push(mobi.site);

			if (!stor) {
				stor = new_stor;
				storage.set('url_history', new_stor);
			}
			mobi.history.setTemplate();
		},

		'set': function(url) {
			var history_get = mobi.history.get(),
				in_index = history_get['urls'].indexOf(url);

			console.log(in_index);

			if (in_index != -1) {
				history_get['urls'].splice(in_index, 1);
			}

			history_get['urls'].push(url);
			storage.set('url_history', history_get);

		},

		'setTemplate': function() {
			loadTemplate('#history_panel', 'history', mobi.history.get());
		},

		'get': function() {
			return storage.get('url_history');
		},

		'list': function() {
			var get_history = this.get(),
				get_html = '';

			get_history['urls'].reverse();

			for (var x in get_history) {
				get_html += '<li><a href="#" class="history_url" data-url="' + get_history[x] + '">' + get_history[x] + '</a></li>';
			}
			$('#history_menu ul').html(get_html);
		}
	},
	'go': function(url) {
		mobi.site = url;
		mobi.sites.init();
		mobi.history.set(url);
		mobi.history.setTemplate();
		cards.init();
		$('#url_input').blur().val(url);
		$('#iframe_view').attr('src', url);
	},

	'refresh': function() {
	    this.go(mobi.site);
	}
};

//! modal
var modal = {
	'show': function() {
		this.loading();
		$('#modal').fadeIn('fast');
	},
	'hide': function() {
		$('#modal').fadeOut('fast', function() {
			$('#modal > div').hide();
		});
	},
	'loading': function() {
		$('#modal_loading').toggle();
	},
	'err': function(er) {
		this.loading();
		$('#modal_error p').html(er)
		$('#modal_error').show();
		$('#modal_error p').html(er)
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
				if (e.target.parentNode.id == 'card_form') {
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


	$('.history_url a').on('click', function(evt) {
		evt.preventDefault();
		console.log(this);
		mobi.go($(this).data('url'));
	});

	//draggable stuff
	$('#redmine_issue').draggable({ containment: "parent" });

    $('#rotate_iframe').on('click', function() {
	    viewRotate();
    });

    $('#frame_reload').on('click', function(e) {
    	e.preventDefault();
    	mobi.refresh();
    });
	$('.panel-menu-button').on('click', function(e) {
		e.preventDefault();
		var $cl = $(this).data('id'),
			$mnu = $('.panel-menu');

		$('.panel-menu').each(function() {
			if ($(this).is(':visible') && $(this).attr('id') != $cl) {
				$mnu.fadeOut()
			}
		});
		$('#'+$cl).fadeToggle();
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

	$('#modal').on('click', function() {
		modal.hide();
	});

	$('#redmine_issue .close_issue').on('click', redmine.closeIssue);

	$('button.issue_view').on('click', function() {
		redmine.issues($(this).val());
	})

	//! init app
	mobi.init();
});
