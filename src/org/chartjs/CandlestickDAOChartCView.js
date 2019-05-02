/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'CandlestickDAOChartCView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.dao.ArraySink',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.ChartCView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'String',
      name: 'chartType',
      documentation: `Refer to 'https://www.chartjs.org/docs/latest/charts/' for the various types of charts`,
      factory: function() {
        return 'line';
      }
    },
    {
      class: 'Map',
      name: 'config'
    },
    {
      class: 'Map',
      name: 'candlestickMap'
    },
    {
      class: 'Map',
      name: 'customDatasetStyling',
      documentation: `
        Property map that would hold the customization for each key type in the candlestickDAO.
        1. Key must equal the candlestick's key.
        2. Value mapped with key must be a 1:1 mapping defined in chartjs.org's documentation.
      `
    },
    {
      class: 'Map',
      name: 'customChartOptions',
      documentation: `
        Property map that would hold the options customization for the chart.
        1. Key Value pairs must be a 1:1 mapping defined in chartjs.org's documentation.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'dataPointProperty',
      factory: function() {
        return this.Candlestick.AVERAGE;
      }
    }
  ],

  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      var self = this;
      this.add(this.slot(function( config ) {
        if ( config ) {
          return this.E().tag(self.ChartCView, { config: self.config });
        }
      }));
    },

    function generateConfig() {
      var config = {
        type: this.chartType,
        data: this.generateData(),
        options: this.generateOptions()
      };

      return config;
    },

    function generateData() {
      var configData = {
        datasets: this.generateDataSets()
      };

      return configData;
    },

    function generateDataSets() {
      var self = this;
      var datasets = [];
      Object.keys(this.candlestickMap).forEach(function( key ) {
        const value = self.candlestickMap[key].array;
        var dataset = {};
        // default label will be the key of the candlestick
        dataset['label'] = key;
        var pointData = [];

        value.forEach(function ( candlestick ) {
          var point = {};
          point['x'] = candlestick.closeTime;
          point['y'] = candlestick[self.dataPointProperty.name];
          pointData.push(point);
        });

        dataset['data'] = pointData;

        // This should allow maximum configurability by devs.
        if ( self.customDatasetStyling ) {
          // If custom styling is provided for any key
          var customStyling = self.customDatasetStyling[key];
          if ( customStyling ) {
            // If custom styling is provided for this specific key
            Object.keys(customStyling).forEach(function( key ) {
              dataset[key] = customStyling[key];
            });
          }
        }
        datasets.push(dataset);
      });

      return datasets;
    },

    function generateOptions() {
      var options = {};

      // Default X-Axis scale
      options['scales'] = {
        xAxes: [{
          type: 'time',
          distribution: 'linear'
        }]
      };

      if ( this.customChartOptions ) {
        var self = this;
        Object.keys(this.customChartOptions).forEach(function( key ) {
          options[key] = self.customChartOptions[key];
        });
      }

      return options;
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        // Data (which should be a CandlestickDAO) has been updated
        if ( ! this.data ) {
          // data was set to null
          return;
        }
        var self = this;
        this.data.orderBy(this.Candlestick.CLOSE_TIME).select(this.GROUP_BY(this.Candlestick.KEY, this.ArraySink.create())).then( function(a) {
          self.candlestickMap = a.groups;
          self.config = self.generateConfig();
        })
      }
    }
  ]
});
