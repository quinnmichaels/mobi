"use strict"
// global variables
var window_timer = 0;

function toggleMenu() {
	var offset = 0,
		$height = $('#mobi_menu').height() + offset,
		$pos = Math.abs(parseFloat($('#panel').css('bottom'))),
		nextPos = $pos == 0 ? '-' + $height + 'px' : 0,
		contPos = $pos == $height ? $height : 0;

		console.log('pos: ' + $pos);
		console.log('content: ' + contPos);

	$('#panel').animate({
	    bottom: nextPos
	});
	$('.content_container').animate({
//		bottom: Math.abs(contPos)
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

function loadTemplate(id, tmp, tmpData, _tmpType) {
	var source,
		template,
		path = '_hbs/' + tmp + '.hbs',
		$i = $(id);

	$.ajax({
		url: path,
		cache: true,
		success: function (data) {
			source = data;
			template = Handlebars.compile(source);
			$i = $(id);
			switch (_tmpType) {
				case 'append':
					$i.append(template(tmpData));
					break;
				case 'prepend':
					$i.prepend(template(tmpData));
					break;
				case 'replace':
					$i.replaceWith(template(tmpData));
					$('input[name="idx"]').val(parseFloat($i.attr('id')));
					break;
				default:
					$i.html(template(tmpData));
					break;
			}
		}
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
	'init': function() {},
	'tmr': function() {
		return {'date': timer.timerDate(), 'hr':'0', 'min': '00', 'sec': '00'};
	},

	'get': function() {
		var t = mobi.sites.get()['cards'][timer.idx].timer;
		return t[t.length - 1];
	},

	'set': function(t) {
		var s = mobi.sites.get(),
			endIdx = s['cards'][timer.idx].timer.length - 1;

		if (s['cards'][timer.idx].timer[endIdx]['date'] == timer.timerDate()) {
			s['cards'][timer.idx].timer[endIdx] = t;
		} else {
			s['cards'][timer.idx].timer.push(timer.tmr());
		}
		storage.set(mobi.site, s);
	},

	'timerDate': function() {
		var d = new Date(),
			c_date = d.getDate(),
			c_month = d.getMonth() + 1,
			c_year = d.getFullYear();

		return c_month + '-' + c_date + '-' + c_year;
	},

	'timerCheckDate': function(d) {
		var cdate = d == timerDate() ? true : false;
		return cdate;
	},

	'start_stop': function(id) {

		var sym = '&plus;',
			$this = $('#'+id+' .start_stop');

		if ($this.hasClass('start')) {
			$('.start_stop').removeClass('stop', function() {
				$(this).addClass('start').html('&plus;');
			})
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
		timer.stop();
		var $timer = $('#' + this.cur + ' > input'),
			t = timer.get();
			t.hr = parseFloat(t.hr);
			t.min = parseFloat(t.min);
			t.sec = parseFloat(t.sec);

		t.sec++;
		if (t.sec == 60) {
			t.sec = 0;
			t.min++;
		}
		if (t.min == 60) {
			t.min = 0;
			t.hr++
		}

		t.hr = t.hr;
		t.min = t.min < 10 ? '0' + t.min : t.min;
		t.sec = t.sec < 10 ? '0' + t.sec : t.sec;

		$timer.val( t.hr + ':' + t.min + ':' + t.sec );
		timer.set(t);
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
		cards.list();
		cards.cardSortable('#card_list');
		$('button[data-action="delete"]').on('click', cards.delete);
	},

	'cardSortable': function(sel) {
		var $drag;
		//! draggable cads
		$(sel).sortable({
			revert: 200,
			tolerance: 'pointer',
			start: function(e, ui) {
				timer.stop();
				$drag = $('#' + ui.item[0].id);
				$drag.addClass('dragging');
			},
			stop: function() {
				$drag.removeClass('dragging');
				cards.cardSort();
			}
		});
		//! card options menu
		$(sel).disableSelection();
	},

	'cardBlank': function() {
		return {'title':'','due':'', 'issue':'', 'status':'','desc':'', 'timer': [timer.tmr()], 'checklist':[]};
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
		cards.list();
	},

	'get': function() {
		return mobi.sites.get()['cards'];
	},

	'list': function() {
		loadTemplate('#card_list', 'card', mobi.sites.get(), 'insert');

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
	'update': function(idx, new_card) {
		var s = mobi.sites.get(),
			c = new_card;
			c.timer = s.cards[idx].timer;

		s.cards[idx] = c;
		storage.set(mobi.site, s);
	},

	'save': function() {
		var s = mobi.sites.get(),
			idx = $('#card_form [name="idx"]').val(),
			save_card = {
		    	'title': $('#card_form [name="title"]').val(),
				'due': $('#card_form [name="due"]').val(),
				'status': $('#card_form [name="status"]').val(),
				'desc': $('#card_form [name="desc"]').val().replace(/\n/g, "<br />"),
				'issue': $('#card_form [name="issue"]').val(),
				'checklist': [],
				'timer': []
			};
			save_card.timer.push(timer.tmr());
			console.log(s.cards);

			if (s.cards.length && idx != 'new') {
				save_card.checklist = s.cards[idx].checklist;
			}

		if (save_card.title) {
			if (idx == 'new') {
			    this.add(save_card);
				this.create();
			} else {
				this.update(idx, save_card);
			}
			this.list();
	    }
	},

	'edit': function(e) {
		var fmtd = mobi.sites.get()['cards'][e];
		loadTemplate('#'+ e + '-card', 'card-form', fmtd, 'replace');
	},

	'delete': function(idx) {
		var s = mobi.sites.get(),
			$id = $('#'+idx+'-card');

		s['cards'].splice(idx, 1);

		if (confirm('are you sure')) {
			storage.set(mobi.site, s);
			$id.hide(175, function() {
				$id.remove();
			});
		}
	},

	'archive': function() {

	},

	'menu': function(e) {
		var $cm = $('#'+e),
			$height = $cm.height() - 18,
			$pos = Math.abs(parseFloat($cm.css('bottom'))),
			nextPos = $pos == 0 ? '-' + $height + 'px' : 0;
		$cm.animate({bottom: nextPos});
	},

	'checklist': {
		'get': function() {

		},

		'view': function(idx, caller) {
			console.log(caller);
			$(caller).toggleClass('active');

			var $clkID = '#' + idx + '-checklist';
			$($clkID + ' > div').animate({width: 'toggle'});
		},

		'list': function(idx) {
			var s = mobi.sites.get(),
				crd = s.cards[idx],
				lst = '';
			for (var x in crd.checklist) {
				lst += '<li class="check-item"><span class="check-done icon-unchecked"></span><span class="check-text">' + crd.checklist[x].text + '</span></li>';
			}
			$('#' + idx + '-card .card_options_menu .card-checklist .tasks-count').html(crd.checklist.length);
			$('#' + idx + '-checklist > div .check-list').html(lst);
		},

		'checklistAdd': function(idx, dn, tx) {
			var s = mobi.sites.get(),
				chk = s.cards[idx].checklist,
				newItem = {'done':dn,'text':tx};

				console.log(idx);

				chk.reverse();
				chk.push(newItem);
				chk.reverse();

				s.cards[idx].checklist = chk;
				storage.set(mobi.site, s);
				cards.checklist.list(idx);
		},

		'checklistSave': function(sender) {
			console.log(sender);
			var $chkIdx = $(sender).data('index'),
				$chkDone = $('#' + $chkIdx + '-card .check-form-container [name="checklist-done"]'),
				$chkVal = $('#' + $chkIdx + '-card .check-form-container [name="checklist-item"]');

			console.log($chkVal.val());

			if ($chkVal.val() !== 'undefined') {
				cards.checklist.checklistAdd($chkIdx, $chkDone.val(), $chkVal.val());

				$chkVal.val('');
				cards.checklist.list($chkIdx);
			}
		},

		'checklistSortable': function() {
			$('.check-list').sortable({
				revert: 200,
				tolerance: 'pointer',
				start: function(e, ui) {
					$(this).addClass('dragging');
				},
				stop: function() {
					$(this).removeClass('dragging');
				}
			});
			//! card options menu
			$('.check-list').disableSelection();

			$('.check-done').on('click', function() {
				$(this).toggleClass('icon-unchecked').toggleClass('icon-check').parent().toggleClass('done');
				if ($(this).hasClass('icon-check')) {
					console.log(this);
				}
			});
		},
		'checklistSort': function(e,u) {
			var new_arr = [],
				s = mobi.sites.get();

/*
			$('#card_list li').each(function() {
				new_arr.push(s['cards'][parseFloat(this.id)]);
			});
			s['cards'] = new_arr;
			storage.set(mobi.site, s);
			cards.list();
*/
		}
	}
};

//! mobi
var mobi = {
	'site': '',
	'init': function() {
		redmine.init()
		mobi.site = $('#iframe_view').attr('src');
		mobi.sites.init();
		mobi.devices.display();
		mobi.devices.view(mobi.devices.get());
		mobi.history.init();
		cards.init();
		//! load init templates into app
		loadTemplate('#settings_panel', 'settings', mobi.sites.get()['settings'], 'insert');

		mobi.sites.list();
	},

	'sites': {
		'init': function() {
			this.set(mobi.site);
		},
		'get': function() {
			return storage.get(mobi.site);
		},
		'set': function(si) {
			var s = storage.get('sites'),
				new_site = {
					'url': si,
					'title': si,
					'desc': si,
					'cards': [],
					'statuses': [
						{name:'to-do',color:'red'},
						{name:'in-progress', color:'yellow'},
						{name:'on-hold', color:'green'},
						{name:'complete', color:'darkgray'}
					],
					'settings': {
						'red_url': '',
						'red_key':''
					}
				};

			if (!storage.check(si)) {
				storage.set(si, new_site);
			}
		},
		'list': function() {
			var sl = localStorage.length,
				skip = ['url_history','view'],
				retSites = [];

			for (var i = 0; i < sl; i++) {
				var tKey = localStorage.key(i);
				if (skip.indexOf(tKey) == -1) {
					retSites.push(storage.get(localStorage.key(i)));
				}
			}
			return retSites;
		},
		'global_view': function() {
			var s = mobi.sites.list();
			loadTemplate('#global_view', 'global', s, 'insert')
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
				deviceLI += '<li id="' + x + '"><button data-view="' + x + '">' + x + '</button></li>';
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

			if (in_index != -1) {
				history_get['urls'].splice(in_index, 1);
			}

			history_get['urls'].push(url);
			storage.set('url_history', history_get);
		},

		'setTemplate': function() {
			var hist = mobi.history.get();
				hist['urls'].reverse();
			loadTemplate('#history_panel', 'history', hist, 'insert');
		},

		'get': function() {
			return storage.get('url_history');
		},
		'go': function(url) {
			$('#history_panel').fadeOut('fast');
			mobi.go(url);
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
var timesheet = {
	'close': function() {
		$('#timesheet').fadeOut('fast');
	},

	'view': function(i) {
		var s = storage.get(mobi.site),
			ts = s['cards'][i].timer;

		$('#timesheet').fadeIn('fast');
		//get issue
		loadTemplate('#timesheet', 'timesheet', ts);
	}
}
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

			case 186:
				/*
				$('#panel, .content_container').fadeToggle('fast');
				$('#global_view').fadeToggle('fast', function() {
					mobi.sites.global_view();
				});
				*/
				vdev('fullscreen'); // alt/opt + 0
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
	$('#redmine_issue, #timesheet').draggable({ containment: "parent" });

    $('#rotate_iframe').on('click', function() {
	    viewRotate();
    });

    $('#frame_reload').on('click', function(e) {
    	e.preventDefault();
    	mobi.refresh();
    });

	$('.panel-menu-button').on('click', function(e) {
		e.preventDefault();

		if (Math.abs(parseFloat($('#panel').css('bottom')))) {
			toggleMenu();
		}

		var $cl = $(this).data('id'),
			$mnu = $('.panel-menu'),
			$mobi = $('#mobi_menu');

		$mnu.each(function() {
			if ($(this).is(':visible') && $(this).attr('id') != $cl) {
				$mnu.hide()
			}
		});
		$('#'+$cl).fadeToggle('fast');
	});

    $('#menu_button').on('click', toggleMenu);

    $('#url_form').submit(function(e) {
	   e.preventDefault();
	   var go_url = $('#url_input').val();
	   mobi.go(go_url);
	   cards.list();
    });

	$('#modal').on('click', function() {
		modal.hide();
	});



	//! init app
	mobi.init();

	// run after app init
    $('#add_card').on('click', cards.create);

    $('#devices button').on('click', function(e) {
	    e.preventDefault();
	    mobi.devices.view($(this).data('view'));
    });

    $('.history_url a').on('click', function(e) {
		e.preventDefault();
		$('#history_panel').fadeOut();
		mobi.go($(this).data('url'));
    });

	$('#redmine_issue .close_issue').on('click', redmine.closeIssue);
});
