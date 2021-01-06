/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDRangeView',
  extends: 'foam.u2.property.MDInput',

  css: '^ { padding: 12px 0; width: 300px; }',

  properties: [
    [ 'type',     'range' ],
    [ 'step',     0 ],
    [ 'minValue', 0 ],
    [ 'maxValue', 100 ],
    [ 'onKey',    true ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.step ) this.attrs({step: this.step});
      this.attrs({min: this.minValue, max: this.maxValue$});
    },
    function updateMode_(mode) {
      if ( mode === foam.u2.DisplayMode.RO || mode === foam.u2.DisplayMode.DISABLED ) this.setAttribute('disabled', true);
      this.show(mode !== foam.u2.DisplayMode.HIDDEN);
    }
  ]
});
