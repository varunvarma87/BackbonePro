define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'util/constants',
  'text!/templates/nav/nav.html',
  'dropit',
  'evil',
], function($, _, Backbone, Router, Constants, DashboardNavTemplate){

  var NavView = Backbone.View.extend({
    el: '#app',
    events: {
    },
    setRouter: function(router) {
      this.router = router;
    },
    render: function(){
      // Using Underscore we can compile our template with data
      var data = {};
      var compiledTemplate = _.template(DashboardNavTemplate, data);
      console.log("-= Dashboard render.")

      // Append our compiled template to this Views "el"
      $('#nav').html( compiledTemplate );
      $('.menu').dropit();
    }
  });
  // Our module now returns our view
  return NavView;
});