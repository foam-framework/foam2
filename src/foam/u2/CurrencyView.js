/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'CurrencyView',
  extends: 'foam.u2.FloatView',

  documentation: 'View for formatting cents into dollars.',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  properties: [
    ['precision', 2],
    ['trimZeros', false]
  ],

  methods: [
    function dataToText(val) {
      return this.SUPER(val / 100);
    },

    function textToData(text) {
      return Math.round(this.SUPER(text) * 100);
    },

    function formatNumber(val) {
      return val.toFixed(2);
    },

    function link() {
      this.SUPER();

      // If the values is currently displaying 0.00, then when
      // you select focus the screen changes its value to '',
      // so that you don't have to delete the 0.00 to enter your
      // value.
      this.on('focus', () => {
        var view = this.attrSlot(null, this.onKey ? 'input' : null);
        if ( ! this.data ) { view.set(''); }
      });
    }
  ]
});
