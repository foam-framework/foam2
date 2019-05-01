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
    'foam.sink.ArraySink',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.ChartCView'
  ],

  reactions: [
    ['', 'propertyChange.chart', 'candlesticksUpdate'],
    ['', 'propertyChange.candlestickMap', 'candlestickMapUpdate'],
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'org.chartjs.ChartCView',
      name: 'chart'
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
      name: 'candlestickMap'
    },
    {
      class: 'Map',
      name: 'keyCustomStyling',
      documentation: `
        Property map that would hold the customization for each key type in the candlestickDAO.
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
      this.tag(this.ChartCView, null, this.chart$);
    },

    function generateConfig() {
      var config = {};

      config.type = this.chartType;
      config.data = this.generateData();
      config.options = this.generateOptions();

      return config;
    },

    function generateData() {
      var configData = {};

      configData.datasets = this.generateDataSets();

      return configData;
    },

    function generateDataSets() {
      var datasets = [];

      for ( const [key, value] of this.candlestickMap.entries() ) {
        var dataset = {};
        // TODO: get custom label if it exists to use as label for this dataset
        dataset.label = key;
        // TODO: get steppedLine customization
        var data = [];

        value.map( candlestick =>
          data.push({
            x: candlestick.closeTime,
            y: candlestick[this.dataPointProperty.name]
          });
        );

        // TODO: get custom css and put into the data set.

        datasets.push(dataset);
      }

      return datasets;
    },

    function generateOptions() {
      var options = {};

      // Default X-Axis scale
      options.scales = {
        xAxes: [{
          type: 'time',
          distribution: 'linear'
        }]
      };

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
        })
      }
    },
    {
      name: 'candlestickMapUpdate',
      isFramed: true,
      code: function() {
        // candlesticks has been updated
        if ( ! this.candlestickMap || ! this.chart ) {
          // neither candlesticks or chart exists
          return;
        }

        this.chart.config = this.generateConfig();
      }
    }
  ]
});
