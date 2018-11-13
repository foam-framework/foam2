foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Line',
  extends: 'org.chartjs.Line',
  imports: [
    'visualizationWidth',
    'visualizationHeight',
    'data as visualization'
  ],
  properties: [
    {
      name: 'width',
      expression: function(visualizationWidth) { return visualizationWidth; }
    },
    {
      name: 'height',
      expression: function(visualizationHeight) { return visualizationHeight; }
    }
  ],
  methods: [
    function initCView(x) {
      this.SUPER(x);
      this.data$ = this.visualization$.dot('data');
    }
  ]
});
