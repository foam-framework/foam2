foam.CLASS({
  package: 'org.chartjs',
  name: 'AbstractChartCView',
  extends: 'foam.graphics.CView',
  requires: [
    'org.chartjs.Lib'
  ],
  properties: [
    'chart',
    'chartType',
    'colors',
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
    {
      name: 'data',
      postSet: function(_, n) {
        this.onDetach(n.sub(function(sub) {
          if ( n !== this.data ) sub.detach();
          else this.update();
        }.bind(this)));
      },
    },
  ],
  reactions: [
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
    function updateChart_(data) {
      // Template method, in child classes update the chart's data
      // from our data.
    }
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        if ( this.chart && this.data ) this.updateChart_(this.data);
      }
    }
  ]
});
