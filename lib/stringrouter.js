var StringRouter = function(config) {

	var config = config || {};
	var noMatch = config.noMatch || {error: 'No Match'};
	
	var patterns = [];
	
	var bindPattern = function(str, callback) {
		
		var replacements = str.match(/\{.*?\}{1,2}/g), matcher = str,
			replacement, raw, params = [], element, name, reg, components;
	
		if (replacements) {
			for (var i = 0; i < replacements.length; i++) {
				raw = replacements[i];
				replacement = raw.replace(/\{/, "").replace(/\}$/, "");
				components = replacement.split(":");
				name = components[0];
				reg = (components.length > 1) ? "(" + components[1] + ")" : "([\\w\\d]+)";
				matcher = matcher.replace(raw, reg);				
				params.push(name);
			}
		}
		
		matcher = "^" + matcher + "$";

		element = {
			template: str,
			matcher: new RegExp(matcher),
			params: params
		};
		
		if (callback) {
			element.callback = callback;
		}
		
		patterns.push(element);
		
	};
	
	var dispatch = function(str, callback) {
		
		for (var index in patterns) {
			
			var pattern = patterns[index],
				match = str.match(pattern.matcher),
				params = {};
			
			if (match) {
				for (var i = 0; i < pattern.params.length; i++) {
					params[pattern.params[i]] = match[i + 1];
				}
				if (pattern.callback) {
					pattern.callback.call(undefined, params, callback);
				} else {
					callback.call(undefined, undefined, params);
				}
				return;
			}
			
		}
		
		callback.call(undefined, noMatch, undefined);
	};
	
	return {
		bindPattern: bindPattern,
		dispatch: dispatch,
		getPatterns: function () {
			return patterns;
		}
	}
	
};

exports.getInstance = function(config) {
	return new StringRouter(config);
};
