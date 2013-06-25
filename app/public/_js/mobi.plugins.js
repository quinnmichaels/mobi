(function( $ ){

	$.fn.toggleCheckListButtons = function() {
		var html = '<div class="check-menu"><button class="icon-edit"></button><button class="icon-trash"></button></div>';
		$(this).append(html);
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