function updateFeed() {
	$.get('/messages', function(data) {
		if (data) {
			$('#messages').html(data);
		} else {
			window.location.href = '/';
		}
	});

	setTimeout(updateFeed, 5000);
}

$(function() {
	updateFeed();
});