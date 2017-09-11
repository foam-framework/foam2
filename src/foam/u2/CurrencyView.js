/**
@license
Copyright 2017 The FOAM Authors. All Rights Reserved.
http://www.apache.org/licenses/LICENSE-2.0
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
    [
      [ 'precision', '2']
    ]
  ],

  methods: [
    function dataToText(val) {
      return this.precision !== undefined ?
        this.formatNumber(val / 100) :
        '' + val ;
    },

    function textToData(text) {
      return parseFloat(text) * 100 || 0;
    }
  ]
});