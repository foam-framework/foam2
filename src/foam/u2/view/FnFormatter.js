/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FnFormatter',
  implements: [ 'foam.u2.view.Formatter' ],
  properties: [
    {
      class: 'Function',
      name: 'f'
    }
  ],
  methods: [
    function format(e, value, obj, axiom) {
      this.f.call(e, value, obj, axiom);
    }
  ]
});
