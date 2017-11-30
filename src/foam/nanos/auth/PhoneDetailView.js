/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PhoneDetailView',
  extends: 'foam.u2.View',

  documentation: 'Phone Detail View',

  requires: [ 'foam.nanos.auth.Phone' ],

  css: `
    ^ {
      height: auto;
    }
    ^.span {
      display: inline;
      margin-top: 10px;
    }
    ^.property-number {
      display: inline;
      margin-left: 10px;
      margin-right: 10px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
          start().
              add(this.Phone.NUMBER.label).add(this.Phone.NUMBER).
              add(this.Phone.VERIFIED.label).add(this.Phone.VERIFIED).
          end()
    }
  ]
});
