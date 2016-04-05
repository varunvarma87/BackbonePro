/**
 * Created by apiuser on 8/12/15.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'models/model',
        'util/constants'
    ],
    function($, _, Backbone, Model, Constants) {
        //console.log(Model);
        var ModelCollection = Backbone.Collection.extend({
            url: function() {
                if (this.get('id') === undefined) {
                    return Constants.base_url + "/" + this.get('experiment_id');
                } else {
                    return Constants.base_url + "/" + this.get('experiment_id') + "/" + this.get('id')
                }
            },
            //url: Constants.base_url + '/v1/experiments/a605043c-727c-4936-9754-4a9f0545eaa0/models',
            model: Model,
            meta: {},
            initialize: function() {
            },
            parse: function (response) {
                if (response.data) {
                    return response.data;
                }
                return response;
            }
        });
        return ModelCollection;
    });