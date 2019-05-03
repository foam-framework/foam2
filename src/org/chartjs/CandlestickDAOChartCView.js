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
      name: 'candlestickMap',
      hidden: true,
      documentation: `
        Map returned from the provided CandlestickDAO. This will be used by the various methods extracting the
        information to be placed in the chart.
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
      // Each dataset is represented by a key in the CandlestickDAO
      Object.keys(this.candlestickMap).forEach(function( key ) {
        const candlesticks = self.candlestickMap[key].array;
        var dataset = {};

        // Array of points that will represent all the candlesticks that share the same key
        var pointData = [];
        candlesticks.forEach(function ( candlestick ) {
          var point = {};
          point['x'] = candlestick.closeTime;
          point['y'] = candlestick[self.dataPointProperty.name];
          pointData.push(point);
        });
        dataset['data'] = pointData;

        // Default title to represent the dataset
        dataset['label'] = key;

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

      return datasets;
    },

    function generateOptions() {
      var options = {};

      // Default X-Axis scale for candlesticks.
      options['scales'] = {
        xAxes: [{
          type: 'time',
          distribution: 'linear'
        }]
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
          self.candlestickMap = a.groups;
          self.config = self.generateConfig();
        });
      }
    }
  ]
});
