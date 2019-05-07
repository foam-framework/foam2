/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.bootstrap',
  name: 'CheckBox',
  extends: 'foam.u2.CheckBox',

  properties: [

  ],

  methods: [
    function initE() {
      this.SUPER();
    },

    function load() {
      this.SUPER();
    },

    function initCls() {
      this.addClass('custom-control-input');
    }
  ]
});
