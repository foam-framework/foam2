/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'ConfigurableChartView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'org.chartjs.Pie',
  ],
  imports: [
    'classloader',
  ],
  properties: [
    'view',
    {
      name: 'config',
      factory: function() {
        return this.Config.create();
      },
    },
  ],
  classes: [
    {
      name: 'Config',
      properties: [
        {
          class: 'Int',
          name: 'height',
          value: 500,
        },
        {
          class: 'Int',
          name: 'width',
          value: 1000,
        },
        {
          class: 'StringArray',
          name: 'colors',
          factory: function() {
            return [
              'red',
              'green',
              'blue',
              'orange',
              'purple',
            ]
          },
        },
      ],
    },
  ],
  methods: [
    function initE() {
      this.
        start(this.DetailView, { data: this.config }).end().
        add(this.slot(function(data, view, config$colors, config$height, config$width) {
          return this.classloader.load(this.view).then(function(cls) {
            return cls.create({
              data: data,
              colors: config$colors,
              height: config$height,
              width: config$width,
            })
          }.bind(this))
        }));
    },
  ],
});
