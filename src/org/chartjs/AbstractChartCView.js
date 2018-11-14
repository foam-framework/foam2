foam.CLASS({
  package: 'org.chartjs',
  name: 'AbstractChartCView',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.mlang.sink.GroupBy',
    'org.chartjs.Lib',
  ],
  properties: [
    'chart',
    'chartType',
    'colors',
    'data',
    {
      name: 'config',
      factory: function() {
        return {
          type: this.chartType,
          datasets: [{}],
          options: {
            responsive: false,
            maintainAspectRatio: false
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
    function toChartData(data) {
      var keys = data.sortedKeys();

      if ( this.GroupBy.isInstance(data.arg2) ) {
        var xValues = {};
        keys.forEach(function(k) {
          Object.keys(data.groups[k].groups).forEach(function(k2) {
            xValues[k2] = true;
          })
        });
        xValues = Object.keys(xValues);
        xValues.sort();
        return {
          labels: xValues,
          datasets: keys.map(function(k, i) {
            return {
              label: k,
              data: xValues.map(function(x) {
                var y = data.groups[k].groups[x] ?
                  data.groups[k].groups[x].value : null
                return { y: y, x: x }
              }),
            }
          })
        };
      } else {
        return {
          labels: keys,
          datasets: [
            {
              label: data.arg2.label || data.arg2.model_.label,
              data: keys.map(function(k) { return data.groups[k].value; })
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
            } else if ( foam.Object.isInstance(to) ) {
              to = to || {};
              Object.keys(from).forEach(function(k) {
                to[k] = copyFrom(to[k], from[k])
              });
              return to;
            }
            return from;
          }
          var data = this.genChartData_(this.data);
          copyFrom(this.chart.data, data);
          this.chart.update();
        }
      }
    }
  ]
});
