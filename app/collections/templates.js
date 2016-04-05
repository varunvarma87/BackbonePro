define([
	'jquery',
	'underscore',
	'backbone',
	'util/constants',
	'models/template',
	],
	function($, _, Backbone, Constants, Template) {
		var TemplateCollection = Backbone.Collection.extend({
			url: Constants.base_url + '/v1/templates',
			meta: {},
			model: Template,
			initialize: function() {
			},
			parse: function (response) {
				if (response.data) {
					return response.data;
				}
				return response;
			}
		});
		return TemplateCollection;
	});