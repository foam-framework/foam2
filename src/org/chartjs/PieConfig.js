foam.CLASS({
  package: 'org.chartjs',
  name: 'PieConfig',
  properties: [
    {
      name: 'type',
      value: 'pie',
    },
    {
      class: 'Float',
      name: 'height',
      value: 200,
    },
    {
      class: 'Float',
      name: 'width',
      value: 200,
    },
    {
      class: 'StringArray',
      name: 'backgroundColor',
      factory: function() {
        return [
          'yellow',
          'fuchsia',
          'red',
          'silver',
          'gray',
          'olive',
          'purple',
          'maroon',
          'aqua',
          'lime',
          'teal',
          'green',
          'blue',
          'navy',
        ]
      },
    },
  ],
});
