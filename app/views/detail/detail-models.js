define([
    'jquery',
    'underscore',
    'backbone',
    'util/constants',
    'models/experiment',
    'models/model',
    'views/detail/create-model',    
    'text!/templates/detail/detail.html',
    'text!/templates/detail/models-subview.html',
    'text!/templates/detail/models-subview-list.html',
    'moment',
    'semantic',
], function($ ,_ , Backbone, Constants, Experiment, Model, CreateModelView, DetailContainerTemplate, ModelListContainerTemplate, ModelListTemplate, moment){



    var DetailView = Backbone.View.extend({
        // use the body as the parent so we capture events from the vex dialog
        el: 'body',
//defaults:{newId:0},
        initialize: function(options) {
            this.options = options;
           //console.log();
        },
        events: {
            'click .back-btn': 'navBack',
            'click .tabpanel__tab': 'changeTab',
            'click .action': 'handleAction',
            'click .model-action': 'handleModelAction'
        },
        setRouter: function(router) {
            this.router = router;
        },
        renderModelTab: function(){
            var that = this;
            // Fetch the experiment for this page
            const experiment = new Experiment({'id':this.options['eid']});
            experiment.fetch().done(function(resp) {
                this.experiment = experiment;
                console.log(experiment);
                // compile the main template for this detail page
                const compiledMainTemplate = _.template(DetailContainerTemplate, {'experiment': experiment});
                console.log("compiledMainTemplate");
                console.log(compiledMainTemplate);
                 $('#main').html( compiledMainTemplate );
                $('[data-href="models"]').addClass('active');
                const modelListContainer = _.template(ModelListContainerTemplate, {});
                $('#detail-content').html( modelListContainer );
                that.renderModelList();
                // Semantic ui
                $('.ui.dropdown').dropdown();
            });
            this.experiment = experiment;
        },
        renderModelList: function(ev) {
            console.log('render the model list')
            console.log(this.experiment)
            const that = this;
            this.experiment.fetch().done(function() {
                const template = _.template(ModelListTemplate, {'moment': moment, 'experiment': that.experiment});
                $('#model-list-container').html(template);
                $('.ui.dropdown').dropdown();
            })

        },
        handleAction: function(ev) {
            const action = $(ev.currentTarget).attr('data-action');
            if (action === 'addModel') {
                this.showCreateModelModal();
            }
        },
        showCreateModelModal: function(ev) {
            if (this.createModelView === undefined) {
                this.createModelView = new CreateModelView();
                // detailView.listenTo(this, 'cleanup', detailView.undelegateEvents);
                this.listenTo(this.createModelView, 'modelCreated', this.renderModelList);
                this.createModelView.setExperiment(this.experiment);

            }
            this.createModelView.render();
        },
        changeTab: function() {
            console.log("models page");
            console.log(this);
           /*const kind = $(ev.currentTarget).attr('data-href');
            if (kind === 'models') {
                 const url = 'experiments/' + this.experiment.get('id') + '/models';
                 this.router.navigate(url, {trigger: true});

            }*/
            //const url = 'experiments/' + this.experiment.get('id') + '/models';

        },
        navBack: function(ev) {
            this.router.navigate('', { trigger: true });
        },
        handleModelAction: function(ev) {
            const action = $(ev.currentTarget).attr('data-action');
            const id = $(ev.currentTarget).attr('data-id');
            if (action === 'train') {
                const model = _.findWhere(this.experiment.get('models'), {'id':id});
                const m = new Model(model);
                m.on('change:status', this.renderModelList, this);
                m.train();
                $(ev.currentTarget).find("i").remove()
                $(ev.currentTarget).addClass('loading')
            } else if (action === 'deploy') {
                const dep_model_data = _.findWhere(this.experiment.get('models'), {'id':id});
                const dep_model = new Model(dep_model_data);
                dep_model.on('change:status', this.renderModelList, this);
                dep_model.deploy();
                $(ev.currentTarget).find("i").remove()
                $(ev.currentTarget).addClass('loading')
            }
        }
    });
    // Our module now returns our view
    return DetailView;
});