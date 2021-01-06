/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'NoBackStack',
  properties: [
    'delegate'
  ],
  methods: [
    function push(v, parent, opt_id) {
      this.delegate.push(v, parent, opt_id);
    },
    function back() {}
  ]
});