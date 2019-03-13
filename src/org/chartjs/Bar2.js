foam.CLASS({
  package: 'org.chartjs',
  name: 'Bar2',
  extends: 'foam.graphics.CView',
  requires: [
    'org.chartjs.Lib'
  ],
  properties: [
    'chart',
    {
      name: 'data',
      setter: function(v) {
        if ( this.chart ) this.chart.data = v;
        else this.instance_.data = v;
        this.update();
      },
      getter: function(v) {
        return this.chart ? this.chart.data :
          foam.Undefined.isInstance(this.instance_.data) ? ( this.instance_.data = { datasets: [] } ) :
          this.instance_.data;
      }
    },
    {
      name: 'options',
      getter: function() {
        return this.chart ? this.chart.options :
          foam.Undefined.isInstance(this.instance_.options) ? ( this.instance_.options = { responsive: false, maintainAspectRation: false } ) :
          this.instance_.options;
      },
      setter: function(v) {
        if ( this.chart )
          this.chart.options = v
        else
          this.instance_.options = v;
      }
    },
  ],
  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, {
        type: 'bar',
        data: this.data,
        options: this.options
      });
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
        this.chart && this.chart.update();
      }
    }
  ]
});
