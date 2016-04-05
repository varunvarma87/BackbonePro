// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
	paths: {
		'jquery': 'vendor/jquery/dist/jquery',
		'underscore': 'vendor/underscore-amd/underscore',
		'backbone': 'vendor/backbone-amd/backbone',
		'text': 'vendor/requirejs-text/text',
		'dropit': 'vendor/dropit/dropit',
		'evil': 'vendor/evil-icons/assets/evil-icons.min',
		'vex': 'vendor/vex/js/vex.min',
		'vexDialog': 'vendor/vex/js/vex.dialog.min',
		'd3': 'vendor/d3/d3',
		'c3': 'vendor/c3/c3',
		'knob': 'vendor/jquery-knob/dist/jquery.knob.min',
		'moment': 'vendor/moment/min/moment.min',
		'semantic': 'vendor/semantic/dist/semantic.min',
		'sparkline': 'vendor/jquery.sparkline/dist/jquery.sparkline.min',
		'serializeObject':'vendor/jquery-serialize-object/dist/jquery.serialize-object.min'
	},
	shim: {
		'vex': {
			deps: ['jquery'],
			exports: 'vex'
		},
		'dropit': {
			deps: ['jquery'],
			exports: 'dropit'
		},
		'vexDialog': {
			deps: ['jquery'],
			exports: 'vexDialog'
		},
		'c3': {
			deps: ['d3'],
			exports: 'c3'
		},
		'sparkline': {
			deps: ['jquery'],
			exports: 'sparkline'
		},
		'serializeObject': {
			deps: ['jquery'],
			exports: 'serializeObject'
		}
	}
});

require([
// Load our app module and pass it to our definition function
'app',
], function(App){
	App.initialize();
});