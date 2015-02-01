var fs = require("fs"),
	path = require('path'),
	handlebars = require("handlebars"),
	mainTemplateFile = fs.readFileSync(path.join(__dirname, '../views/main.html'), 'utf8'),
	homeTemplateFile = fs.readFileSync(path.join(__dirname, '../views/home.html'), 'utf8'),
	errorTemplateFile = fs.readFileSync(path.join(__dirname, '../views/error.html'), 'utf8'),
	profileTemplateFile = fs.readFileSync(path.join(__dirname, '../views/partials/profile.html'), 'utf8');

module.exports = {
	setup: function() {
		handlebars.registerPartial({
			profile: profileTemplateFile,
		});

		handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
			switch (operator) {
				case '==':
					return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '===':
					return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '<':
					return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
					return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
					return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
					return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
					return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
					return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
					return options.inverse(this);
			}
		});

		return {
			mainTemplate: handlebars.compile(mainTemplateFile),
			errorTemplate: handlebars.compile(errorTemplateFile)
		};
	}
};