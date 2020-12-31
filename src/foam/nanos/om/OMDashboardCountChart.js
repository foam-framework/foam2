/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMDashboardCountChart',
  extends: 'org.chartjs.CandlestickDAOChartView',

  css: `
  ^container-no-data {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  ^message-no-data {
    background-color: white;
    font-size: 16px;
    margin: 0;
    padding: 8px;
    border: solid 1px /*%GREY3%*/ #cbcfd4;
    border-radius: 3px;
  }
  `,

  messages: [
    {
      name: 'LABEL_NO_DATA',
      message: 'Not enough data to graph'
    },
    {
      name: 'LABEL_LOADING',
      message: 'Loading Data...'
    }
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate'
    },
    {
      class: 'Date',
      name: 'endDate'
    },
    {
      class: 'Boolean',
      name: 'hasDatapoints',
      expression: function(config) {
        if ( ! config.data || ! config.data.datasets ) return false;
        return config.data.datasets.length > 0 ? true : false;
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    }
  ],

  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      this.dataUpdate();
      window.addEventListener('resize', this.onResize);
      var self = this;

      this.start('div', null, this.parentEl_$)
        .style({
          position: 'relative',
          width: '100%',
          height: '100%'
        })
        .add(this.chart_$)
        .add(this.slot(function( hasDatapoints, isLoading ) {
          return hasDatapoints ? self.E() :
            self.E().addClass(self.myClass('container-no-data'))
              .start('p').addClass(self.myClass('message-no-data'))
                .callIf(isLoading, function() {
                  this.add(self.LABEL_LOADING);
                })
                .callIf(!isLoading, function() {
                  this.add(self.LABEL_NO_DATA)
                })
              .end();
        }))
      .end();
    },

    // Massage datapoints is to display the data in such a way that is easy to
    // read and understand. Datapoints for liquidity settings will be
    // extended to imply that the setting is being applied at this point.
    function massageThresholds(data) {
      // [{x, y}]
      var datapoints = data.data;
      var first = datapoints[0];
      if ( first.x != this.startDate ) datapoints.splice(0, 0, { x: this.startDate, y: first.y });
      var last = datapoints[datapoints.length - 1];
      if ( last.x != this.endDate ) datapoints.push({ x: this.endDate, y: last.y });
      data.data = datapoints;

      // TODO: start date that is coming in is inconsistent with the values shown
      // NEEDS BUGFIX
      return data;
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.isLoading = true;
        this.data
          .orderBy(this.xExpr)
          .select(this.GROUP_BY(this.keyExpr, this.PLOT(this.xExpr, this.yExpr)))
          .then(function(sink) {
            // Clear data before cloning because it gets clobbered anyway.
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);
            config.data = {
              datasets: Object.keys(sink.groups).map(key => {
                var data = {
                  label: key,
                  data: sink.groups[key].data.map(arr => ({ x: arr[0], y: arr[1] }))
                };
                if ( key.includes(':high') || key.includes(':low') ) {
                  data = self.massageThresholds(data);
                }
                var style = self.customDatasetStyling[key] || {};
                Object.keys(style).forEach(function(k) {
                  data[k] = style[k];
                });
                return data;
              })
            };
            self.config = config;
            self.isLoading = false;
          });
      }
    }
  ]
});
