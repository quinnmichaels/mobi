"use strict"
// global variables
var window_timer = 0,
	remote_site = '';

function panelPos() {
	return Math.abs(parseFloat($('#panel').css('bottom')));
}
function toggleMenu() {
	var offset = 0,
		$height = $('#mobi_menu').height() + offset,
		$pos = Math.abs(parseFloat($('#panel').css('bottom'))),
		nextPos = $pos == 0 ? '-' + $height + 'px' : 0,
		contPos = $pos == $height ? $height : 0;

	$('#panel').animate({
	    bottom: nextPos
	});
	$('.content_container').animate({
//		bottom: Math.abs(contPos)
	});
};

function viewRotate() {
	var $iframe = $('#iframe_view'),
	frameW = $iframe.css('width'),
	frameH = $iframe.css('height');

	$iframe.animate({
		width: frameH,
		height: frameW
	});
};

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

function statusTime() {
	var d = new Date(),
		hours = d.getHours(),
		minutes = d.getMinutes(),
		ampm = hours >= 12 ? 'p' : 'a',
		strTime;

	hours = hours ? hours % 12 : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	strTime = hours + ':' + minutes + ampm;

	$('#status-time').text(strTime);
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
		return cards.cardList[timer.idx].timer;
	},

	'set': function(t, tMethod) {
		var curTimer = timer.get();

		switch (tMethod) {
			case 'new':
				curTimer.splice(0,0,t);
				break;

			case 'update':
				curTimer[0] = t;
				break;
		}
		cards.cardList[timer.idx].timer = curTimer;
		cards.cardStorage();
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
			$this = $('#'+id+' .start_stop'),
			$parent = $this.parent().parent().parent();

		$('.card.card-active').removeClass('card-active');

		if ($this.hasClass('start')) {
			$('.start_stop').removeClass('stop', function() {
				$(this).addClass('start').html('&plus;');
			})
			timer.cur = id;
			timer.idx = parseFloat(id);
			timer.get();
			timer.start();
			sym = '&times;';

			$parent.addClass('card-active');

		} else {
			timer.stop();
		}

			$this.toggleClass('start')
				.toggleClass('stop')
				.html(sym);
	},

	'start': function() {
		timer.stop();

		var $timer = $('#' + this.cur + ' > input'),
			tM = 'update',
			t = timer.get()[0];

		if (t.date != timer.timerDate()) {
			tM = 'new';
			t = timer.tmr();
		}

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

		timer.set(t, tM);

		$timer.val( t.hr + ':' + t.min + ':' + t.sec );
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
		this.cardList = mobi.sites.get()['cards'];
		this.list();
		console.log(this.cardList);
		this.cardSortable('#card_list');

		$('button[data-action="delete"]').on('click', cards.delete);
	},

	'cardList': '',

	'cardBlank': function() {
		return {'title':'','due':'', 'issue':'', 'status':'','desc':'', 'timer': [timer.tmr()], 'checklist':[]};
	},

	'cardStorage': function() {
		var s = mobi.sites.get();
			s.cards = cards.cardList;
			storage.set(mobi.site, s)
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

				if ($('#checklist').is(':visible')) checklist.close();
			},
			stop: function(e, ui) {
				$drag.removeClass('dragging');
				cards.cardSort($drag);
			}
		});
		//! card options menu
		$(sel).disableSelection();
	},

	'cardSort': function(caller) {
		var new_arr = [],
			idx = parseFloat($(caller).attr('id')),
			cl = this.cardList;

		$('#card_list li').each(function() {
			new_arr.push(cl[parseFloat(this.id)]);
		});

		this.cardList = new_arr;
		this.cardStorage();
		this.list();
	},

	'list': function() {
		timer.stop();
		loadTemplate('#card_list', 'card', cards.cardList, 'insert');
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

				loadTemplate('#card_list', 'card-form', cards.cardBlank(), 'prepend');
				break;

			case 'close':
				n_state = 'add';
				$('#add_card').html('&plus;');
				$('#card_form').parent().fadeOut().remove();
				break;
		}


		$('#add_card').attr('data-state', n_state);

	},

	'update': function(idx, update_card) {
		var c = update_card;
			c.timer = cards.cardList[idx].timer;
			c.checklist = cards.cardList[idx].checklist;

		cards.cardList[idx] = c;
	},

	'save': function() {
		var $idx = $('#card_form [name="idx"]').val(),
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

		if (save_card.title) {
			if ($idx == 'new') {
				cards.cardList.splice(0,0,save_card);
				this.create();
			} else {
				this.update($idx, save_card);
			}

			cards.cardStorage();
			cards.list();
	    }
	},

	'edit': function(e) {
		var fmtd = mobi.sites.get()['cards'][e];
		loadTemplate('#'+ e + '-card', 'card-form', fmtd, 'replace');
	},

	'delete': function(idx) {
		var $id = $('#'+idx+'-card');

		if (confirm('are you sure')) {
			cards.cardList.splice(idx, 1);
			cards.cardStorage();

			$id.hide(175, function() {
				$(this).remove();
			});
		}
	},
};

//! mobi
var mobi = {
	'init': function() {

		mobi.site = 'blank.html'; //$('#iframe_view').attr('src');
		mobi.sites.init();
		mobi.devices.display();
		mobi.devices.view(mobi.devices.get());
		mobi.history.init();
		//! load init templates into app
		loadTemplate('#settings_panel', 'settings', mobi.sites.get()['settings'], 'insert');

		mobi.sites.list();
		cards.init();
		redmine.init()
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
				'label':	'Fullscreen',
				'icon': 	'icon-fullscreen',
				'width': 	'100%',
				'height': 	'100%',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'desktop': {
				'label':	'Desktop',
				'icon': 	'icon-desktop',
				'width': 	'1600px',
				'height': 	'850px',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'ipad': {
				'label':	'iPad',
				'icon': 	'icon-apple',
				'width': 	'1024px',
				'height': 	'748px',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'iphone4': {
				'label':	'iPhone 4',
				'icon':		'icon-apple',
				'width': 	'320px',
				'height': 	'460px',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'iphone5': {
				'label':	'iPhone 5',
				'icon':		'icon-apple',
				'width': 	'320px',
				'height': 	'548px',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'galaxy': {
				'label':	'Galaxy',
				'icon':		'icon-android',
				'width': 	'360px',
				'height':	'620px',
				'statusbar': {
					'template': '',
					'height': ''
				}
			},
			'galaxyt3': {
				'label':	'Galaxy Tab 3',
				'icon': 	'icon-android',
				'width': 	'1200px',
				'height': 	'580px',
				'statusbar': {
					'template': '',
					'height': ''
				}
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
				dList = mobi.devices.list;

			for (var x in dList) {
				deviceLI += '<li id="' + x + '"><button data-view="' + x + '"><span class="' + dList[x].icon + '"></span>' + dList[x].label + '</button></li>';
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

			$('#status-view').text(cur_view.label);

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
		statusTime();
	    this.go(mobi.site);
	}
};

var timesheet = {
	'close': function() {
		$('#timesheet').fadeOut('fast');
	},

	'view': function(i) {
		var ts = cards.cardList[i];

		$('#timesheet').fadeIn('fast');
		//get issue
		loadTemplate('#timesheet', 'timesheet', ts);
	}
}

//! checklist
var checklist = {
	'view': function(idx, caller) {
		var $caller = $(caller),
			crd = cards.cardList[idx];
			crd.idx = idx;

		if (caller) {
			$('.card-checklist').removeClass('active');
			$(caller).toggleClass('active');
			$('#checklist').fadeIn('fast');
		}

		//get issue
		loadTemplate('#checklist', 'checklist', crd);
	},

	'done': function(caller) {
		var $call = $(caller),
			chkIdx = $call.parent().data('index'),
			crdIdx = $call.parent().parent().data('index'),
			crd = cards.cardList[crdIdx],
			chk = crd.checklist[chkIdx],
			chkDone = chk.done == 0 ? 1 : 0;

		$call.toggleClass('icon-unchecked').toggleClass('icon-check').parent().attr('data-done', chkDone);;

		cards.cardList[crdIdx].checklist[chkIdx].done = chkDone;
		checklist.checklistCount(crdIdx);
		cards.cardStorage();
	},

	'close': function() {
		$('.card-checklist.active').removeClass('active');
		$('#checklist').fadeOut('fast');
	},

	'checklistCount': function(idx) {
		var chkList = cards.cardList[idx].checklist,
			openItems = chkList.filter(function(x) {return (x.done == 0)}).length,
			$taskCount = $('#' + idx + '-card .tasks-count');

		$taskCount.html(openItems);
	},

	'checklistAdd': function(idx, dn, tx, pr) {
		var chk = cards.cardList[idx].checklist,
			newItem = {'done':dn,'text':tx,'priority':pr};

		chk.splice(0,0,newItem);

		cards.cardList[idx].checklist = chk;
		cards.cardStorage();
		checklist.checklistCount(idx);
		this.view(idx, false);
	},

	'checklistSave': function(sender) {
		var $chkIdx = $(sender).data('index'),
			$chkDone = $('#check-form-container [name="checklist-done"]'),
			$chkVal = $('#check-form-container [name="checklist-item"]'),
			$chkPrior = $('#check-priority').text();

		if ($chkVal.val() !== 'undefined' && $chkVal.val().length) {
			checklist.checklistAdd($chkIdx, $chkDone.val(), $chkVal.val(), $chkPrior);
			$chkVal.val('');
			checklist.view($chkIdx, false);
		}
	},

	'checklistSortable': function() {
		$('#check-list-items').sortable({
			revert: 200,
			tolerance: 'pointer',
			start: function(e, ui) {
				$(this).addClass('dragging');
			},
			stop: function() {
				$(this).removeClass('dragging');
				checklist.checklistSort();
			}
		});
		//! card options menu
		$('#check-list-items').disableSelection();

	},

	'checklistSort': function() {
		var new_arr = [],
			$idx = $('#check-list-items').data('index');

		$('#check-list-items li').each(function() {
			new_arr.push(cards.cardList[$idx].checklist[$(this).data('index')]);
		});
		cards.cardList[$idx].checklist = new_arr;
		cards.cardStorage();
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
//		console.log(e.which);  // log keypress

		function vdev(d) {
			mobi.devices.view(d);
		}
		switch (e.which) {
			case 172:
				e.preventDefault();
				$('#url_input').focus().select();
				break;

			case 8710: //alt/opt + j to toggle menu
				e.preventDefault();
				toggleMenu();
				break;

			case 730: // alt/opt + k create a new card;
				e.preventDefault();
				if (panelPos()) {
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
				vdev('iphone4');
				break;

			case 162: // alt/opt + 4
				vdev('iphone5');
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

	//! click: reload site
    $('#frame_reload').on('click', function(e) {
    	e.preventDefault();
    	mobi.refresh();
    });

	//! click: history button
    $('#frame_history').on('click', function(e) {
    	e.preventDefault();
		if (panelPos()) {
			toggleMenu();
		}
	    $('#history_panel').fadeIn();
    });

	//! click: settings button
    $('#frame_settings').on('click', function(e) {
    	e.preventDefault();
		if (panelPos()) {
			toggleMenu();
		}
	    $('#settings_panel').fadeIn();
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


// run when window unloads
$(window).on('unload', function() {
	timer.stop();
});