foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartConfig',
  requires: [
    'org.chartjs.ChartSize',
  ],
  properties: [
    {
      class: 'Enum',
      of: 'org.chartjs.ChartSize',
      name: 'size',
      value: 'MEDIUM',
    },
    {
      class: 'Float',
      name: 'height',
      hidden: true,
      expression: function(size) {
        return size === this.ChartSize.SMALL ? 200 :
          size === this.ChartSize.MEDIUM ? 300 :
          size === this.ChartSize.LARGE ? 400 : 0
      },
    },
    {
      class: 'Float',
      name: 'width',
      hidden: true,
      expression: function(size) {
        return size === this.ChartSize.SMALL ? 200 :
          size === this.ChartSize.MEDIUM ? 300 :
          size === this.ChartSize.LARGE ? 400 : 0
      },
    },
    {
      class: 'StringArray',
      name: 'colors',
      factory: function() {
        return [
          'aqua',
          'blue',
          'fuchsia',
          'gray',
          'green',
          'lime',
          'maroon',
          'navy',
          'olive',
          'purple',
          'red',
          'silver',
          'teal',
          'yellow',
        ]
      },
    },
  ],
});
