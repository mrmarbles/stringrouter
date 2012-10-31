var namespaces = {};

var StringRouter = function(cfg) {

	var config = cfg || {};
	var noMatch = config.noMatch || {error: 'No Match'};
	
	var patterns = [];
	
	var bindPattern = function(str, callback) {
		
		var replacements = str.match(/\{.*?\}{1,2}/g), matcher = str,
			replacement, raw, params = [], element, name, reg, components, ns;
	
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
			variables: params
		};
		
		if (callback) {
			element.callback = callback;
		}

		patterns.push(element);
		
	};
	
	var dispatch = function(str, callback, data) {
		
		// create the data object
		var packet = {
			data: data,
			config: config
		}
		
		for (var index in patterns) {
			
			var pattern = patterns[index],
				match = str.match(pattern.matcher),
				params = {};
			
			if (match) {
				
				// compile parameters
				for (var i = 0; i < pattern.variables.length; i++) {
					params[pattern.variables[i]] = match[i + 1];
				}
				
				// append the params packet
				packet['params'] = params;
				
				if (pattern.callback) {
					pattern.callback.call(undefined, packet, callback);
				} else {
					callback.call(undefined, undefined, packet);
				}
				return;
			}
			
		}
		
		callback.call(undefined, noMatch, packet);
	};
	
	var hasMatch = function(str) {
		
		var index, pattern;
		
		for (index in patterns) {
			pattern = patterns[index];
			if (str.match(pattern.matcher)) {
				return true;
			}
		}
		
		return false;
	};
	
	var ignore = function(str) {
		this.bindPattern(str, function() {});
	};
	
	var namespace = function(ns) {
		if (!namespaces[ns]) {
			namespaces[ns] = new StringRouter(config);
		}
		return namespaces[ns];
	};
	
	return {
		bindPattern: bindPattern,
		dispatch: dispatch,
		hasMatch: hasMatch,
		ignore: ignore,
		namespace: namespace,
		ns: namespace,
		namespaces: function() {
			var spaces = [];
			for (key in namespaces) {
				spaces.push(key);
			}
			return spaces;
		},
		getPatterns: function () {
			return patterns;
		},
		getConfig: function() {
			return config;
		}
	}
	
};

exports.getInstance = function(config) {
	return new StringRouter(config);
};
