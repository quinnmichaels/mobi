(function( $ ){

	$.fn.toggleCheckListButtons = function() {
		var chkHTML = '<div class="check-menu"><button class="icon-edit"></button><button class="icon-trash"></button></div>';
		$(this)
			.append(chkHTML)
			.hover(
				function () {
					$(this).children().filter('.check-menu').show(0);
				},
				function () {
					$(this).children().filter('.check-menu').hide(0);
				}
		);

	};

	$.fn.showButton = function() {
		$(this).attr('data-active', 'true');
	};

	$.fn.hideButton = function() {
		$(this).attr('data-active', 'false');
	};

	$.fn.showModal = function() {
		$(this).fadeIn();
	};

	$.fn.hideModal = function() {
		$(this).fadeOut();
	};

})( jQuery );