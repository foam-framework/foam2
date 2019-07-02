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
    'org.chartjs.Lib'
  ],

  properties: [
    {
      class: 'Map',
      name: 'config'
    },
    {
      class: 'Simple',
      name: 'chart_'
    }
  ],

  reactions: [
    ['', 'propertyChange.config', 'invalidate']
  ],

  methods: [
    function paintSelf(x) {
      if ( this.chart_ ) this.chart_.destroy();
      this.chart_ = new this.Lib.CHART(x, this.config);
      this.chart_.render();
    }
  ]
});