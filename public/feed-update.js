function updateFeed() {
	$.get('/messages', function(data) {
		$('#messages').html(data);
	});

	setTimeout(updateFeed, 5000);
}

$(function() {
	updateFeed();
});