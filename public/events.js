$('#tvit-content').keyup(function() {
	if ($('#tvit-btn').hasClass('disabled') && this.value.length > 0 && this.value.length <= 140) {
		$('#tvit-btn').removeClass('disabled');
	} else if (this.value.length === 0 || this.value.length > 140) {
		$('#tvit-btn').addClass('disabled');
	}
});

$(document).on('mouseover', '.message-wrapper', function() {
	$(this).find('img.delete-btn').show();
});

$(document).on('mouseleave', '.message-wrapper', function() {
	$(this).find('img.delete-btn').hide();
});

$(document).on('click', '.delete-btn', function() {
	var id = $(this).data("id");

	$.post("/delete", {
		id: id
	}, function(data) {
		$('#messages').html(data);
	});

	var count = parseInt($('#messages-count').text()) - 1;
	$('#messages-count').text(count);
	if (count === 1) {
		$('#messages-text').text('твит');
	} else {
		$('#messages-text').text('твита');
	}
});

$(document).on('click', '#tvit-btn', function(e) {
	e.preventDefault();
	var data = $('#add-tvit').serialize();

	$.post("/post", data, function(data) {
		$('#messages').html(data);
	});

	$('#add-tvit').trigger('reset');

	var count = parseInt($('#messages-count').text()) + 1;
	$('#messages-count').text(count);
	if (count === 1) {
		$('#messages-text').text('твит');
	} else {
		$('#messages-text').text('твита');
	}
});