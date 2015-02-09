$('#tvit-content').keyup(function() {
	if ($('#tvit-button').hasClass('disabled') && this.value.length > 0 && this.value.length <= 140) {
		$('#tvit-button').removeClass('disabled');
	} else if (this.value.length === 0 || this.value.length > 140) {
		$('#tvit-button').addClass('disabled');
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
	var authorName = $(this).data("author");

	$.post("/delete", {
		id: id,
		authorName: authorName
	}, function(data) {
		$('#messages').html(data);
	});
});