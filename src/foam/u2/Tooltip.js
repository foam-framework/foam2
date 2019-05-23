/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'Tooltip',

  documentation: 'Tooltip handler.',

  properties: [
    {
      name: 'target'
    }
  ],

  methods: [
    function init() {
      console.log('TODO: tooltip stuff');
      this.target.setAttribute('title', this.target.tooltip);
    }
  ]
});
