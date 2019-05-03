/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'ChartCView',
  extends: 'foam.graphics.CView',

  requires: [
    'org.chartjs.Lib',
  ],

  properties: [
    'chart',
    'config',
    ['width', 300],
    ['height', 300]
  ],

  methods: [
    function initCView(x) {
      this.chart = new this.Lib.CHART(x, this.config);
    },
    function paintSelf(x) {
      this.chart.render();
    }
  ]
});
