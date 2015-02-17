var PATTERN = /(^|\s)#([a-zA-Z\u0400-\u04FF\d\-_]+)/ig,
	moment = require('moment'),
	escape = require('escape-html');

module.exports = function() {
	var getMessageWithHashtags = function(content) {
			var anchor = '$1<a href="/search?query=$2">#$2</a>';
			return content.replace(PATTERN, anchor);
		},

		getTimeInterval = function(datePublished) {
			var interval = moment().diff(moment(datePublished), 'years');
			var period = interval === 1 ? 'година' : 'години';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'months');
			period = interval === 1 ? 'месец' : 'месеца';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'weeks');
			period = interval === 1 ? 'седмица' : 'седмици';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'days');
			period = interval === 1 ? 'ден' : 'дни';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'hours');
			period = interval === 1 ? 'час' : 'часа';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'minutes');
			period = interval === 1 ? 'минута' : 'минути';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'seconds');
			period = interval === 1 ? 'секунда' : 'секунди';
			return 'преди ' + interval + ' ' + period;
		},

		getMessagesModel = function(messages) {
			messages.forEach(function(message) {
				message.content = getMessageWithHashtags(escape(message.content));
				message.time = getTimeInterval(message.datePublished);
			});

			return messages;
		},

		unique = function(value, index, self) {
			return self.indexOf(value) === index;
		};

	return {
		getMessagesModel: getMessagesModel,

		getMessageWithHashtags: getMessageWithHashtags,

		getMessageHashtags: function(message) {
			var hashtags = message.match(PATTERN) || [];
			hashtags = hashtags.map(function(x) {
				return x.split('#')[1];
			});

			return hashtags.filter(unique);
		}
	};
};