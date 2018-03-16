/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.box',
  name: 'AnonymousBox',
  implements: ['foam.box.Box'],
  properties: [
    {
      class: 'Function',
      name: 'f'
    }
  ],
  methods: [
    function send(m) {
      this.f(m);
    }
  ]
});
