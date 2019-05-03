/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'CandlestickDAOChartCView',
  extends: 'foam.u2.View',

  documentation: `
    A view that would generate a chart using chartjs and a supplied CandlestickDAO.
  `,

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
      name: 'data',
      documentation: `
        The supplied CandlestickDAO.
      `
    },
    {
      class: 'String',
      name: 'chartType',
      documentation: `
        Refer to 'https://www.chartjs.org/docs/latest/charts/' for the various types of charts.
        Currently supported by this file: line, bar.
      `,
      factory: function() {
        return 'line';
      }
    },
    {
      class: 'Map',
      name: 'config',
      documentation: `
        The config map that is expected by chartjs. Structure and information can be found in chartjs.org's documentation.
      `
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
      documentation: `
        The Candlestick property we wish to represent on the y-axis on the chart.
      `,
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
          return this.E().tag(self.ChartCView, { config: config });
        }
      }));
    },

    function generateConfig(candlestickMap) {
      var config = {
        type: this.chartType,
        data: this.generateData(candlestickMap),
        options: this.generateOptions()
      };

      return config;
    },

    function generateData(candlestickMap) {
      var self = this;

      var datasets = [];
      // Each dataset is represented by a key in the CandlestickDAO
      Object.keys(candlestickMap).forEach(function( key ) {
        const candlesticks = candlestickMap[key].array;
        
        // Create the various points on the chart
        var points = [];
        candlesticks.forEach(function ( candlestick ) {
          var point = {
            x: candlestick.closeTime,
            y: candlestick[self.dataPointProperty.name]
          };
          points.push(point);
        });

        var dataset = {
          label: key,
          data: points
        };

        // This should allow maximum configurability by devs.
        // Refer to chartjs.org documentation for dataset properties
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

      const configData = {
        datasets: datasets
      };

      return configData;
    },

    function generateOptions() {
      // Default X-Axis scale for candlesticks.
      var options = {
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'linear'
          }]
        }
      };

      // This should allow maximum configurability by devs.
      // Refer to chartjs.org documentation for dataset properties
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
        // Get all candlesticks categorized by their key, and ordered in ascending order by their closeTime.
        this.data.orderBy(this.Candlestick.CLOSE_TIME).select(this.GROUP_BY(this.Candlestick.KEY, this.ArraySink.create())).then( function(a) {
          self.config = self.generateConfig(a.groups);
        });
      }
    }
  ]
});
