/**
 * Created by apiuser on 8/17/15.
 */
/**
 * Created by apiuser on 8/17/15.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'c3',
    'util/constants',
    'models/experiment',
    'models/model',
    'text!/templates/detail/detail.html',
    'text!/templates/detail/results-subview.html',
    'moment',
    'knob',
    'semantic',
    'sparkline'
], function($ ,_ , Backbone,Router,c3,Constants, Experiment,Model,DetailContainerTemplate,
            ResultsContainerTemplate,moment){



    var DetailResultsView = Backbone.View.extend({
        // use the body as the parent so we capture events from the vex dialog
        el: 'body',

        initialize: function(options) {
            console.log(options);
            this.options = options;

        },
        events: {
            'click .back-btn': 'navBack',
            'click .tabpanel__tab': 'changeResultsTab',
            'change #model-choice': 'updateResultsGraph'
        },
        setRouter: function(router) {
            this.router = router;
        },
        renderResultsTab: function(){
            var that = this;
            // Fetch the experiment for this page
            const experiment = new Experiment({'id':this.options['eid']});
            experiment.fetch().done(function(resp) {
                this.experiment = experiment;
                const compiledMainTemplate = _.template(DetailContainerTemplate, {'experiment': experiment});
                $('#main').empty().html( compiledMainTemplate );
                // compile the main template for this detail page
                $('[data-href="models"]').removeClass('active');
                $('[data-href="results"]').addClass('active');
                const resultContainer = _.template(ResultsContainerTemplate, {'moment': moment, 'experiment': that.experiment});
                $('#detail-content').html(resultContainer );
                // Semantic ui
                $('.ui.dropdown').dropdown();
            });
            this.experiment = experiment;


            var chart = c3.generate({
                bindto: '#cost-graph',
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250, 130, 100, 140, 200, 150, 50],
                    ],
                    type: 'bar'
                },
                size: {
                    height: 200
                },
                bar: {
                    width: {
                        ratio: 0.3 // this makes bar width 50% of length between ticks
                    }
                    // or
                    //width: 100 // this makes bar width 100px
                }
            });
            this.renderResultsGraph();
            $('.ui.dropdown').dropdown();
            this.startRealTime();
        },
       changeResultsTab: function(ev) {
            console.log("results page");
           ev.preventDefault();
            /*const kind = $(ev.currentTarget).attr('data-href');
            if (kind === 'results') {

                this.router.navigate('experiments/:id/results', {trigger: true});
            }*/  const that = this;
           const id = $(ev.currentTarget).attr('data-href');
           const url = 'experiments/' + this.experiment.get('id') + '/results';
           this.router.navigate(url, {trigger: true});


           const exp = new Experiment({'id':id});
           exp.destroy({
                   success: function() {
                       that.render();
                   }})
            //this.router.navigate('experiments/id/results', { trigger: true });
            //const id = $(ev.currentTarget).attr('data-href');
            //this.router.navigate('experiments/:id/results', { trigger: true });
        },
        renderKnobs: function(ev) {
            $("#knob-money").knob({
                'min':0,
                'max':1200,
                'width':"150",
                'height':"150",
                'fgColor':"#E67E22",
                'skin':"tron",
                'thickness':".1",
                'readOnly': 'true',
            });
            $("#knob-server").knob({
                'min':0,
                'max':11,
                'width':"150",
                'height':"150",
                'fgColor':"#E67E22",
                'skin':"tron",
                'thickness':".1",
                'readOnly': 'true',
            });
            $("#knob-sla").knob({
                'min':0,
                'max':0,
                'width':"150",
                'height':"150",
                'fgColor':"#E67E22",
                'skin':"tron",
                'thickness':".1",
                'readOnly': 'true',
            });

        },
        startRealTime: function(ev) {
            var that = this;
            $.get(Constants.base_url + '/v1/experiments/1/stream').done(function(data) {
                const timestamps = _.pluck(data, 'timestamp');
                const workloads = _.pluck(data, 'workload');
                const num_instances_predictive_m1 = _.pluck(data, 'num_instances_predictive_m1');
                const num_instances_predictive_m2 = _.pluck(data, 'num_instances_predictive_m2');
                const num_instances_predictive_m3 = _.pluck(data, 'num_instances_predictive_m3');
                const num_instances_reactive = _.pluck(data, 'num_instances_reactive');
                const num_instances_reactive_lg = _.pluck(data, 'num_instances_reactive_lg');

                const sla_reactive = _.pluck(data, 'sla-reactive');
                const sla_model1 = _.pluck(data, 'sla-model1');
                j = 1;
                (function myLoop (i) {
                    console.log(i)
                    setTimeout(function () {
                        $('#workload').html(workloads[i]);
                        $('#reactive').html(num_instances_reactive[i] + num_instances_reactive_lg[i]);
                        $('#predictive').html(num_instances_predictive_m1[i]);
                        $('#workload-sl').sparkline(workloads.slice(j,i+1), {type: 'line', barColor: 'green'} );
                        const reactive_summed_values = _.map(num_instances_reactive.slice(j,i+1), function(value, key, list){
                            return value + num_instances_reactive_lg[j+key]
                        });
                        $('#reactive-sl').sparkline(reactive_summed_values, {type: 'line', barColor: 'green'} );
                        $('#predictive-sl').sparkline(num_instances_predictive_m1.slice(j,i+1), {type: 'line', barColor: 'green'} );

                        $('#sla-p').html(sla_model1[i]);
                        $('#sla-r').html(sla_reactive[i]);

                        const len = 10;
                        if (i > len-1) {
                            j = i - len;
                        }
                        setTimeout(function(){
                            $('.hl-stat').removeClass('highlight');
                        }, 100);
                        $('.hl-stat').addClass('highlight');

                        ++i;
                        if (i < 84) {
                            myLoop(i);      //  decrement i and call myLoop again if i > 0
                        } else {
                            i = 18;
                            myLoop(i)
                        }
                    }, 5000)
                })(18);

            });
        },
        updateResultsGraph: function(ev) {
            const selected = $('#model-choice').dropdown('get value')
            columns = [];
            if (selected.includes('m1')) {
                columns.push(this.num_instances_predictive_m1);
            }
            if (selected.includes('m2')) {
                columns.push(this.num_instances_predictive_m2);
            }
            if (selected.includes('m3')) {
                columns.push(this.num_instances_predictive_m3);
            }
            if (selected.includes('r')) {
                columns.push(this.num_instances_reactive);
                columns.push(this.num_instances_reactive_lg);
            }
            this.results_chart.groups([['num_instances_reactive', 'num_instances_reactive_lg']])
            this.results_chart.load({
                columns: columns,
                unload: ['num_instances_reactive', 'num_instances_reactive_lg', 'num_instances_predictive_m1', 'num_instances_predictive_m2', 'num_instances_predictive_m3'],
                colors: {
                    workloads: '#27AE60',
                    num_instances_predictive_m1: '#03A9F4',
                    num_instances_predictive_m2: '#0D7CAE',
                    num_instances_predictive_m3: '#06435E',
                    num_instances_reactive: '#AA7562',
                    num_instances_reactive_lg: '#795548',
                },
            });
            this.results_chart.data.names({
                num_instances_predictive_m1: 'Predictive Policy 1 - t2.medium',
                num_instances_predictive_m2: 'Predictive Policy 2 - t2.medium',
                num_instances_predictive_m3: 'Predictive Policy 3 - t2.medium',
                num_instances_reactive: 'Reactive Policy - t2.medium',
                num_instances_reactive_lg: 'Reactive Policy - c4.large',
            });
        },
        renderResultsGraph: function() {
            var that = this;
            $.get(Constants.base_url + '/v1/experiments/1/stream').done(function(data) {
                console.log(data)
                // Pluck all of the data points out of the response
                const timestamps = _.pluck(data, 'timestamp');
                const workloads = _.pluck(data, 'workload');
                const num_instances_predictive_m1 = _.pluck(data, 'num_instances_predictive_m1');
                const num_instances_predictive_m2 = _.pluck(data, 'num_instances_predictive_m2');
                const num_instances_predictive_m3 = _.pluck(data, 'num_instances_predictive_m3');
                const num_instances_reactive = _.pluck(data, 'num_instances_reactive');
                const num_instances_reactive_lg = _.pluck(data, 'num_instances_reactive_lg');

                // Render the costs
                that.renderCosts(num_instances_reactive, num_instances_reactive_lg, num_instances_predictive_m1)

                // Prepare the data for hte graph
                timestamps.unshift('timestamp');
                workloads.unshift('workloads')
                num_instances_predictive_m1.unshift('num_instances_predictive_m1')
                num_instances_predictive_m2.unshift('num_instances_predictive_m2')
                num_instances_predictive_m3.unshift('num_instances_predictive_m3')
                num_instances_reactive.unshift('num_instances_reactive');
                num_instances_reactive_lg.unshift('num_instances_reactive_lg');

                that.num_instances_predictive_m1 = num_instances_predictive_m1;
                that.num_instances_predictive_m2 = num_instances_predictive_m2;
                that.num_instances_predictive_m3 = num_instances_predictive_m3;
                that.num_instances_reactive = num_instances_reactive;
                that.num_instances_reactive_lg = num_instances_reactive_lg;

                // Make da graph
                var results_chart = c3.generate({
                    bindto: '#results-graph',
                    data: {
                        x: 'timestamp',
                        columns: [
                            timestamps,
                            workloads
                        ],
                        names: {
                            workloads: '# Pictures Processed'
                        },
                        type: 'bar',
                        types: {
                            workloads: 'spline',
                        },
                        axes: {
                            workloads: 'y2'
                        }
                    },
                    colors: {
                        workloads: '#27AE60',
                        num_instances_predictive_m1: '#03A9F4',
                        num_instances_predictive_m2: '#0D7CAE',
                        num_instances_predictive_m3: '#06435E',
                        num_instances_reactive: '#D35400',
                    },
                    bar: {
                        // width: 7 // this makes bar width 100px
                    },
                    size: {
                        height: 300
                    },
                    zoom: {
                        enabled: true
                    },
                    axis: {
                        x: {
                            label: '# Worker Instances'
                        },
                        y: {
                            label: '# Worker Instances'
                        },
                        y2: {
                            label: '# Pictures Process / Hour',
                            show: true
                        }
                    }
                });
                that.results_chart = results_chart;
            });



        },
        renderCosts: function(num_instances_reactive, num_instances_reactive_lg ,num_instances_predictive_m1) {
            // Compute Costs
            // total_cost = (count of all instances running per unit of time) * (AWS cost per unit of time) *
            const med_conversion = 1.0/2307.69 // = $ / m2.medium instance
            const lg_conversion = 1.0/1090.91 // = $ / m2.medium instance
            const to_month = 1028.57 // hard coded conversion between 42 minutes and 1 month
            const reactive_cost = _.reduce(num_instances_reactive, function(memo, num){ return memo + num; }, 0) * (med_conversion) +
                _.reduce(num_instances_reactive_lg, function(memo, num){ return memo + num; }, 0) * (lg_conversion) * to_month;
            $('#reactive-cost').html('$' + reactive_cost.toFixed(2));
            const predictive_cost = _.reduce(num_instances_predictive_m1, function(memo, num){ return memo + num; }, 0) * (med_conversion) * to_month;
            $('#predictive-cost').html('$' + predictive_cost.toFixed(2));
            const tot_saved = reactive_cost - predictive_cost;
            $('#tot-saved').html('$' + tot_saved.toFixed(2));
        },
        navBack: function(ev) {
            this.router.navigate('', { trigger: true });
        }

    });
    // Our module now returns our view
    return DetailResultsView;
});