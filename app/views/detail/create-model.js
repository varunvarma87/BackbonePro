define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'util/constants',
    'models/model',
    'collections/templates',
    'text!/templates/detail/create-model/modal-container.html',
    'text!/templates/detail/create-model/step-1.html',
    'text!/templates/detail/create-model/step-2.html',
    'text!/templates/detail/create-model/step-3.html',
    'text!/templates/detail/create-model/step-3-list.html',
    'serializeObject',
    'semantic'
], function($, _, Backbone, Router, Constants,Model, TemplateCollection, ModalContainerTemplate, Step1Template, Step2Template ,
        Step3Template, Step3ListTemplate, SerializeObj){

    var CreateModelView = Backbone.View.extend({
        el: 'body',
        events: {
            'click #next-btn': 'saveProgress',
            'click #add-model-variable-btn':'saveProgressVariables',
            'click #back-model-variable-btn': 'goBackToModel',
            'click #back-variable-btn': 'goBackToVariables',
            'change #edit_model_selection': 'approachSelected',
            'click #add-approach-save-btn': 'save'
        },
        save: function() {
            this.trigger('modelCreated');
        },
        initialize: function() {
            this.wasCreated = false;
            this.templates = new TemplateCollection();
        },
        setRouter: function(router) {
            this.router = router;
        },
        setExperiment: function(anExperiment) {
            this.experiment = anExperiment;
        },
        render: function(){
            console.log(this.experiment)            
            var that = this;
            if (!this.wasCreated) {
                const template = _.template(ModalContainerTemplate, {});
                $('#detail-page').append(template);
                this.wasCreated = true;
                this.state = 0;
            }
            $('.small.modal')
                .modal({
                    'onHidden': function() {
                        console.log('hidden');
                        $('.small.modal').empty().remove();
                        that.wasCreated = false;
                    }
                });
            $('.small.modal').modal('show');
            this.state = 0;
            this.advanceStep();
        },
        saveProgress: function(ev) {
            var that = this;
            ev.preventDefault();
            var data = $('#model-form').serializeObject();
            console.log(data)
            if (this.newModel === undefined) {
                this.newModel = new Model(data);
                this.newModel.set('experiment_id', this.experiment.get('id'))
            } else{
                _.each(data, function(value, key) { 
                    that.newModel.set(key,value);
                });
            }
            this.state += 1;
            console.log(this.newModel);
            this.advanceStep();
        },
        advanceStep: function() {
            if (this.state === 0) {
                const addModelTemp = _.template(Step1Template, {});
                $('#model-content').html(addModelTemp);
                $('.sampleinfo').addClass('active');
                $('.samplevariable').removeClass('active');
            } else if (this.state === 1) {
                const variablesTemplate = _.template(Step2Template, {});
                $('#model-content').html(variablesTemplate);
                $('.samplevariable').addClass('active');
                $('.sampleinfo').removeClass('active');
                $('.sampleapproach').removeClass('active');
                $('#multi-select').dropdown();
                $('#search-select').dropdown();
            }  else if (this.state === 2) {                
                const that = this;
                this.templates.fetch().done(function() {
                    const approachTemplate = _.template(Step3Template, {'templates':that.templates});
                    $('#model-content').html(approachTemplate);
                    $('.sampleapproach').addClass('active');
                    $('.samplevariable').removeClass('active');
                    $('.ui.dropdown').dropdown();                    

                });
            } else if (this.state == 3) {
                this.saveModel();
            }
        },
        saveModel: function() {
            const approach_template = this.newModel.get('approach_template');
            approach_template['parameters'] = this.newModel.get('parameters');
            this.newModel.set('approach_template', approach_template);
            this.newModel.unset('parameters');
            const that = this;
            this.newModel.save().done(function(){
                console.log('-= Successfully saved new model! ')
                that.trigger('modelCreated');
            });
        },  
        goBackToModel:function(ev){
            ev.preventDefault();
            this.state = 0 ;
            console.log("pushing state to 1");
            this.render();
        },
        goBackToVariables:function(ev){
            ev.preventDefault();
            this.state = 1;
            console.log("pushing state to 1");
            this.render();
        },
        approachSelected: function(ev) {
            ev.preventDefault();
            // var v = $('#edit_model_selection').dropdown('get item')[0]
            const id = $("#edit_model_selection option:selected").attr('data-id');
            if (id === undefined) {
                return;
            }
            const template = this.templates.get(id)
            const step3List = _.template(Step3ListTemplate, {'template': template});
            $('#attribute-tbody').html(step3List);
        }
    });
    // Our module now returns our view
    return CreateModelView;
});