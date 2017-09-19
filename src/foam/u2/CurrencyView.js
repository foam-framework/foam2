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

  axioms: [
    foam.u2.CSS.create({
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    ['precision', '2']
  ],

  methods: [
    function dataToText(val) {
      return this.SUPER(val / 100);
    },

    function textToData(text) {
      return this.SUPER(text) * 100;
    },

    function formatNumber(val) {
      return val.toFixed(2);
    }
  ]
});
