foam.CLASS({
  package: 'org.chartjs',
  name: 'Line2',
  extends: 'foam.graphics.CView',
  requires: [
    'org.chartjs.Lib',
  ],
  properties: [
    'chart',
    {
      name: 'data',
      factory: function() {
        return {
          datasets: []
        };
      },
      postSet: function() {
        this.update();
      }
    },
    {
      name: 'config',
      factory: function() {
        return {
          type: 'line',
          data: this.data,
          options: {
            responsive: false,
            maintainAspectRatio: false
          }
        };
      }
    }
  ],
  reactions: [
    ['', 'propertyChange.data', 'update' ],
  ],
  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, this.config);
      this.update();
    },
    function paintSelf(x) {
      this.chart.render();
    }
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        if ( ! this.chart ) return;

        this.chart.data = this.data;
        this.chart.update();
      }
    }
  ]
});
