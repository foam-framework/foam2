foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Bar',
  extends: 'org.chartjs.Bar',
  imports: [
    'visualizationWidth',
    'visualizationHeight',
    'visualizationColors',
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
    },
    {
      name: 'colors',
      expression: function(visualizationColors) { return visualizationColors; }
    },
  ],
  methods: [
    function initCView(x) {
      this.data$ = this.visualization$.dot('data');
      this.SUPER(x);
    }
  ]
});
