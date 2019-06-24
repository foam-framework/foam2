/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'AbstractChartView',
  extends: 'foam.u2.View',
  requires: [
    'foam.dao.FnSink',
    'org.chartjs.ChartCView'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Map',
      name: 'config',
    },
    {
      class: 'Int',
      name: 'width',
      value: 750
    },
    {
      class: 'Int',
      name: 'height',
      value: 750
    }
  ],

  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      this.dataUpdate();
      this.style({
        display: 'inline-block',
        width: this.width$,
        height: this.height$
      });
      this.add(this.ChartCView.create({ config$: this.config$, width$: this.width$, height$: this.height$ }));
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        // Template function.
      }
    }
  ]
});
