// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'router', // Request router.js
  'util/constants',
  'evil'
], function($, _, Backbone, Router, Constants){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    console.log("-= Initalizing app...")
    Router.initialize();
  }

  return {
    initialize: initialize
  };
});