var messages = {
	"invalid.field" : "invalid.field:{0}",
	"not.found" : "not.found:{0}",
	"invalid.credentials": "invalid.credentials",
	"invalid.invitation": "invalid.invitation",
	"not.allowed": "not.allowed",
	"user.already.exists": "user.already.exists"
};

/**
 * Returns an exception message for the given key.
 * @param key {String} Message key.
 * @param ... {*} Arguments for the message, if any.
 */
module.exports = function(key) {
	var i, regex;
	var message = messages[key];
	if (!message) {
		return "internal.error";
	}
	for (i = 1; i < arguments.length; i++) {
		regex = new RegExp('\\{' + (i - 1) + '\\}');
		message = message.replace(regex, arguments[i]);
	}
	return message;
};