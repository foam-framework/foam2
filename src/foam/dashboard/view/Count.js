/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Count',
  extends: 'foam.u2.Element',
  imports: [
    'data',
    'visualizationWidth',
    'visualizationHeight'
  ],
  properties: [
    [ 'nodeName', 'div' ]
  ],
  css: `
^ {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: xx-large;
}
`,
  methods: [
    function initE() {
      var view = this;

      this.
        style({
          width: this.visualizationWidth$.map(function(w) { return w + 'px'; }),
          height: this.visualizationHeight$.map(function(h) { return h + 'px'; })
        }).
        addClass(this.myClass()).
        add(this.slot(function(data$data) {
          return this.E('span').
            add(data$data.value);
        }));
    }
  ]
});
