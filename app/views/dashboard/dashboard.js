define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'util/constants',
  'collections/experiments',
  'models/experiment',
  'text!/templates/dashboard/main-panel.html',
  'moment',
  'evil',
], function($, _, Backbone, Router, Constants, ExperimentCollection, Experiment, DashboardMainPanelTemplate, moment){

  var DashboardView = Backbone.View.extend({
    el: '#app',
    events: {
      'click #add-app-btn': 'createNewApp',
      'click .exp-header': 'navigateToExperimentDetails',
      'click .delete': 'deleteExperiment',
    },
    init: function() {

    },
    setRouter: function(router) {
      this.router = router;
    },
    render: function(){
      const experimentCollection = new ExperimentCollection();
      experimentCollection.fetch().done(function() {
        console.log(experimentCollection);
        var compiledMainTemplate = _.template(DashboardMainPanelTemplate, {'moment': moment, 'experimentCollection': experimentCollection});
        $('#main').html( compiledMainTemplate );
        // Render icons
        Constants.renderIcons();
      });
    },
    createNewApp: function(ev) {
      this.router.navigate('new', { trigger: true });
    },
    navigateToExperimentDetails: function(ev) {
      console.log($(ev.currentTarget));
      const id = $(ev.currentTarget).attr('data-id');
      this.router.navigate('experiments/'+id, { trigger: true });
    },
    deleteExperiment: function(ev) {
      ev.preventDefault();
      const that = this;
      const id = $(ev.currentTarget).attr('data-id');
      const exp = new Experiment({'id':id});
      exp.destroy({
        success: function() {
          that.render();
        }
      });

    }
  });
  // Our module now returns our view
  return DashboardView;
});