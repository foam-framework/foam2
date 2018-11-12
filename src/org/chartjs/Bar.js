foam.CLASS({
  package: 'org.chartjs',
  name: 'Bar',
  extends: 'org.chartjs.AbstractChartCView',
  requires: [
    'foam.mlang.sink.GroupBy'
  ],
  properties: [
    [ 'chartType', 'bar' ]
  ],
  methods: [
    function configChart_(chart) {
      chart.options.scales.yAxes[0].ticks.beginAtZero =  true;
    },
    function updateChart_(data) {
      // TODO: Support multiple datasets via nested groupby
      var colors = this.colors;
      var groups = data.groups;
      var keys = data.sortedKeys();
      var data = {
        labels: keys,
        datasets: [
          {
            // TODO: When multiple datasets are supported, use a different color
            // for each dataset.
            backgroundColor: colors[0],

            label: data.arg2.label || data.arg2.model_.label,
            data: keys.map(function(k) { return groups[k].value; })
          }
        ]
      };
      this.chart.data = data
      this.chart.update();
    }
  ]
});
