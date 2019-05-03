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
    // These actual values appear to be ignored but they need to be non-zero.
    // It's up to the parent to enforce height/width constraints.
    ['width', 1],
    ['height', 1]
  ],

  reactions: [
    ['', 'propertyChange.config', 'invalidate']
  ],

  methods: [
    function paintSelf(x) {
      new this.Lib.CHART(x, this.config).render();
    }
  ]
});