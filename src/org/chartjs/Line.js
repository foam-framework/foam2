foam.CLASS({
  package: 'org.chartjs',
  name: 'Line',
  extends: 'org.chartjs.AbstractChartCView',
  requires: [
    'foam.mlang.sink.GroupBy',
  ],
  properties: [
    ['chartType', 'line'],
  ],
  methods: [
    function updateChart_(data) {
      var groups = data.groups;
      var keys = data.sortedKeys();

      if ( this.GroupBy.isInstance(data.arg2) ) {
        // TODO
        return;
      }

      this.chart.data = {
        labels: keys,
        datasets: [
          {
            label: data.arg2.label || data.arg2.model_.label,
            data: keys.map(function(k) { return groups[k].value; })
          }
        ]
      };

      this.chart.update();
    }
  ]
});
