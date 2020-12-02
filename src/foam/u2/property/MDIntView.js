/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDIntView',
  extends: 'foam.u2.property.MDTextField',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  properties: [
    [ 'type', 'number' ],
    { class: 'Int', name: 'data' },
    'min',
    'max'
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.min != undefined ) this.setAttribute('min', this.min);
      if ( this.max != undefined ) this.setAttribute('max', this.max);
    },

    function link() {
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$)
    },

    function fromProperty(p) {
      this.SUPER(p);
      this.min = p.min;
      this.max = p.max;
    }
  ]
});
