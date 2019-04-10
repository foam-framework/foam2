/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartJSPropertyFormatterRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'chartJsFormatter',
      value: function(v) { return v.toLocaleString() },
    },
  ]
});

foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartJSDateFormatterRefinement',
  refines: 'foam.core.Date',
  properties: [
    {
      name: 'chartJsFormatter',
      value: function(d) {
        if ( ! foam.Date.isInstance(d) ) { d = new Date(d) }
        var month = d.getMonth() + 1
        if ( month < 10 ) month = '0' + month
        var day = d.getDate()
        if ( day < 10 ) day = '0' + day
        var year = d.getFullYear()
        return `${year}-${month}-${day}`;
      }
    }
  ]
});

foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartJSDateTimeFormatterRefinement',
  refines: 'foam.core.DateTime',
  properties: [
    {
      name: 'chartJsFormatter',
      value: function(d) {
        if ( ! foam.Date.isInstance(d) ) { d = new Date(d) }
        var month = d.getMonth() + 1
        if ( month < 10 ) month = '0' + month
        var day = d.getDate()
        if ( day < 10 ) day = '0' + day
        var year = d.getFullYear()

        var hour = d.getHours();
        var min = d.getMinutes();
        if ( min < 10 ) min = '0' + min

        return `${year}-${month}-${day} ${hour}:${min}`;
      }
    }
  ]
});

foam.CLASS({
  package: 'org.chartjs',
  name: 'AbstractChartCView',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.dao.ProxySink',
    'foam.mlang.sink.AbstractUnarySink',
    'foam.mlang.sink.GroupBy',
    'org.chartjs.Lib',
  ],
  properties: [
    'chart',
    'chartType',
    'colors',
    'data',
    {
      name: 'xFormatter',
      expression: function(dataProperties_) {
        return dataProperties_[dataProperties_.length - 2].chartJsFormatter ||
          function(v) { return v.toLocaleString() }
      },
    },
    {
      name: 'xAxisLabel',
      expression: function(dataProperties_) {
        return dataProperties_[dataProperties_.length - 2].label
      },
    },
    {
      name: 'yFormatter',
      expression: function(dataProperties_) {
        return dataProperties_[dataProperties_.length - 1].chartJsFormatter ||
          function(v) { return v.toLocaleString() }
      },
    },
    {
      name: 'yAxisLabel',
      expression: function(dataProperties_) {
        return dataProperties_[dataProperties_.length - 1].label
      },
    },
    {
      name: 'tooltipLabelFormatter',
      value: function(tooltipItem, data) {
        var yLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
        if ( foam.Object.isInstance(yLabel) ) yLabel = yLabel.y
        return data.datasets[tooltipItem.datasetIndex].label +
          ': ' + this.yFormatter(yLabel)
      }
    },
    {
      name: 'tooltipTitleFormatter',
      value: function(tooltipItem, data) {
        return tooltipItem[0].xLabel;
      }
    },
    {
      name: 'dataProperties_',
      expression: function(data) {
        var getData = function(data) {
          if ( this.GroupBy.isInstance(data) ) {
            return getData(data.arg1).concat(getData(data.arg2));
          } else if ( this.ProxySink.isInstance(data) ) {
            return getData(data.delegate);
          } else if ( this.AbstractUnarySink.isInstance(data) ) {
            return getData(data.arg1);
          } else {
            return [data]
          }
        }.bind(this);
        return getData(data)
      },
    },
    {
      name: 'config',
      factory: function() {
        return {
          type: this.chartType,
          datasets: [{}],
          options: {
            responsive: false,
            maintainAspectRatio: false,
            tooltips: {
              callbacks: {
                title: this.tooltipTitleFormatter.bind(this),
                label: this.tooltipLabelFormatter.bind(this),
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: this.yFormatter.bind(this),
                  },
                  scaleLabel: {
                    display: true,
                    labelString: this.yAxisLabel,
                  },
                }
              ],
              xAxes: [
                {
                  ticks: {
                    callback: this.xFormatter.bind(this),
                  },
                  scaleLabel: {
                    display: true,
                    labelString: this.xAxisLabel,
                  },
                }
              ]
            }
          }
        };
      }
    },
  ],
  reactions: [
    ['data', 'propertyChange', 'update' ],
    ['', 'propertyChange.data', 'update' ],
    ['', 'propertyChange.chart', 'update' ],
  ],
  classes: [
    {
      name: 'ChartData',
      properties: [
        'key',
        'data',
      ],
    },
  ],
  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, this.config);
      this.configChart_(this.chart);
    },
    function paintSelf(x) {
      this.chart.render();
    },
    function configChart_(chart) {
      // template method
    },
    function genChartData_(data) {
      // Template method, in child classes generate the chart data
      // from our data.
    },
    function normalizeData() {
      var getData = function(data) {
        if ( this.GroupBy.isInstance(data) ) {
          var ps = [];
          var o = [];
          data.sortedKeys().forEach(function(k) {
            ps.push(getData(data.groups[k]).then(function(o2) {
              o2.forEach(function(o3) {
                o.push([k].concat(o3));
              })
            }))
          });
          return Promise.all(ps).then(function() { return o });
        } else if ( this.ProxySink.isInstance(data) ) {
          return getData(data.delegate);
        } else if ( data && data.value ) {
          return Promise.resolve([data.value])
        } else {
          return Promise.resolve([data]);
        }
      }.bind(this);
      return getData(this.data).then(function(o) {
        o.sort(foam.util.compare);
        return o;
      });
    },
    function toChartData(data) {
      var dimensions = data.length && data[0].length;

      if ( dimensions == 3 ) {
        var xValues = [];
        data.forEach(function(row) {
          var x = row[1];
          if ( xValues.indexOf(x) == -1 ) xValues.push(x);
        });
        xValues.sort(foam.util.compare);

        var datasets = [];
        for ( var i = 0 ; i < data.length ; ) {
          var o = { label: data[i][0], data: [] };
          for ( var xi = 0 ; xi < xValues.length ; xi++ ) {
            if ( i >= data.length ) break;
            if ( o.label != data[i][0] ) break;
            var x = xValues[xi];
            var y = null;
            if ( x == data[i][1] ) {
              y = data[i][2];
              i++;
            }
            o.data.push({ x: x, y: y })
          }
          datasets.push(o);
        }
        return {
          labels: xValues,
          datasets: datasets,
        };
      } else {
        return {
          labels: data.map(function(o) { return o[0] }),
          datasets: [
            {
              label: 'Total', // TODO how to customize this?
              data: data.map(function(o) { return o[1] })
            }
          ]
        };
      }
    },
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        if ( this.chart && this.data ) {
          // Simply doing this.chart.data = this.data will cause the entire
          // chart to re-render when chart.update() is called. Doing a deep
          // copyFrom makes the chart update only what it needs to which is a
          // much nicer animation.
          var copyFrom = function(to, from) {
            if ( foam.Array.isInstance(from) ) {
              to = to || [];
              while ( to.length > from.length ) {
                to.pop();
              }
              for ( var i = 0; i < from.length; i++ ) {
                to[i] = copyFrom(to[i], from[i]);
              }
              return to;
            } else if ( foam.Date.isInstance(from) ) {
              return from;
            } else if ( foam.Object.isInstance(to) ) {
              to = to || {};
              Object.keys(from).forEach(function(k) {
                to[k] = copyFrom(to[k], from[k])
              });
              return to;
            }
            return from;
          }

          this.normalizeData().then(function(o) {
            var data = this.genChartData_(o);
            copyFrom(this.chart.data, data);
            this.chart.update();
          }.bind(this))

        }
      }
    }
  ]
});
