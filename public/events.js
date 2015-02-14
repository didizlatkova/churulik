$('#tvit-content').keyup(function() {
	if ($('#tvit-btn').hasClass('disabled') && this.value.length > 0 && this.value.length <= 140) {
		$('#tvit-btn').removeClass('disabled');
	} else if (this.value.length === 0 || this.value.length > 140) {
		$('#tvit-btn').addClass('disabled');
	}
});

$(document).on('mouseover', '.message-wrapper', function() {
	$(this).find('.delete-btn').show();
});

$(document).on('mouseleave', '.message-wrapper', function() {
	$(this).find('.delete-btn').hide();
});

$(document).on('click', '.delete-btn', function() {
	if ($(this).hasClass('deleted')) {
		return;
	}
	
	$(this).addClass('deleted');
	var id = $(this).data("id");

	$.post("/delete", {
		id: id
	}, function(data) {
		$('#messages').html(data);
	});

	var count = parseInt($('#messages-count').text(), 10) - 1;
	$('#messages-count').text(count);
	if (count === 1) {
		$('#messages-text').text('твит');
	} else {
		$('#messages-text').text('твита');
	}
});

$(document).on('click', '#tvit-btn', function(e) {
	e.preventDefault();
	$('#tvit-btn').addClass('disabled');
	var data = $('#add-tvit').serialize();

	$.post("/post", data, function(data) {
		if (data) {
			if (data) {
				$('#messages').html(data);
			}
		}
	});

	$('#add-tvit').trigger('reset');

	var count = parseInt($('#messages-count').text(), 10) + 1;
	$('#messages-count').text(count);
	if (count === 1) {
		$('#messages-text').text('твит');
	} else {
		$('#messages-text').text('твита');
	}
});

$(document).on('click', '.follow-btn', function() {
	$(this).attr('disabled', true);
	var user = $(this).data("user");
	var loggedUser = $(this).data("logged");

	$.post("/follow", {
		user: user
	}, function(data) {
		if (data) {
			$('#follow-wrapper-' + user).html(data);
		} else {
			window.location.href = '/';
		}
	});

	var countFollowers = parseInt($('#followers-count-' + user).text(), 10) + 1;
	$('#followers-count-' + user).text(countFollowers);
	if (countFollowers === 1) {
		$('#followers-text-' + user).text('следващ');
	} else {
		$('#followers-text-' + user).text('следващи');
	}

	var countFollowing = parseInt($('#following-count-' + loggedUser).text(), 10) + 1;
	$('#following-count-' + loggedUser).text(countFollowing);
	if (countFollowing === 1) {
		$('#following-text-' + loggedUser).text('следван');
	} else {
		$('#following-text-' + loggedUser).text('следвани');
	}
});

$(document).on('click', '.unfollow-btn', function() {
	$(this).attr('disabled', true);
	var user = $(this).data("user");
	var loggedUser = $(this).data("logged");

	$.post("/unfollow", {
		user: user
	}, function(data) {
		if (data) {
			$('#follow-wrapper-' + user).html(data);
		} else {
			window.location.href = '/';
		}
	});

	var countFollowers = parseInt($('#followers-count-' + user).text(), 10) - 1;
	$('#followers-count-' + user).text(countFollowers);
	if (countFollowers === 1) {
		$('#followers-text-' + user).text('следващ');
	} else {
		$('#followers-text-' + user).text('следващи');
	}

	var countFollowing = parseInt($('#following-count-' + loggedUser).text(), 10) - 1;
	$('#following-count-' + loggedUser).text(countFollowing);
	if (countFollowing === 1) {
		$('#following-text-' + loggedUser).text('следван');
	} else {
		$('#following-text-' + loggedUser).text('следвани');
	}
});

$('#search-reset').click(function() {
	$('#search-content').val('');
	$('#messages').html('');
});