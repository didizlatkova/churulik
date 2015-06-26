(function() {

    var increaseMessageCount = function() {
        var count = parseInt($('#messages-count').text(), 10) + 1;
        $('#messages-count').text(count);
        if (count === 1) {
            $('#messages-text').text('твит');
        } else {
            $('#messages-text').text('твита');
        }
    };

    $('#tvit-content').keyup(function() {
        if ($('#tvit-btn').hasClass('disabled') && this.value.length > 0 && this.value.length <= 140) {
            $('#tvit-btn').removeClass('disabled');
        } else if (this.value.length === 0 || this.value.length > 140) {
            $('#tvit-btn').addClass('disabled');
        }
    });

    $(document).on('mouseover', '.message-wrapper', function() {
        $(this).find('.delete-btn').show();
        $(this).find('.retvit').show();
    });

    $(document).on('mouseleave', '.message-wrapper', function() {
        $(this).find('.delete-btn').hide();
        $(this).find('.retvit').hide();
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

        increaseMessageCount();
    });

    $(document).on('click', '.follow-btn', function() {
        $(this).addClass('disabled');
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
        $(this).addClass('disabled');
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

    $(document).on('click', '.verify-btn', function() {
        $(this).addClass('disabled');
        var user = $(this).data("user");
        var loggedUser = $(this).data("logged");

        $.post("/verify", {
            user: user
        }, function(data) {
            if (data) {
                $('#verify-wrapper-' + user).html(data);
            } else {
                window.location.href = '/';
            }
        });

        $('#verified-' + user).removeClass('hidden');
    });

    $(document).on('click', '.unverify-btn', function() {
        $(this).addClass('disabled');
        var user = $(this).data("user");
        var loggedUser = $(this).data("logged");

        $.post("/unverify", {
            user: user
        }, function(data) {
            if (data) {
                $('#verify-wrapper-' + user).html(data);
            } else {
                window.location.href = '/';
            }
        });

        $('#verified-' + user).addClass('hidden');
    });

    $(document).on('click', '.delete-user-btn', function() {
        $(this).addClass('disabled');
        var user = $(this).data("user");
        var loggedUser = $(this).data("logged");

        $.post("/delete-user", {
            user: user
        }, function(data) {
            if (data) {
                $('#profile-' + user).addClass('hidden');
            } else {
                window.location.href = '/';
            }
        });

    });

    $('#search-reset').click(function() {
        $('#search-content').val('');
        $('#messages').html('');
    });

    $(document).on('click', '.retvit', function() {
        var retvitedFromUser = $(this).data("retvitedfrom");
        var user = $(this).data("user");
        var content = $(this).data("content");
        $.post("/post", {
            retvitedFrom: retvitedFromUser || user,
            content: content,
            location: ''
        }, function(data) {
            $('#messages').html(data);
        });

        increaseMessageCount();
    });

    $(document).on('click', '#forgot-btn', function() {      
        $.post("/forgot", {
            userName: $('#userNameForgot').val(),
            email: $('#emailForgot').val()
        }, function(data) {
            $('#forgot-modal').html(data);
        });
    });
})();