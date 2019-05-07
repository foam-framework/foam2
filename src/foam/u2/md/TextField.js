/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'TextField',
  //extends: 'foam.u2.tag.Input',
  extends: 'foam.u2.TextField',

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
      this.addClass('mdl-textfield__input').addClass('mdl-js-textfield').addClass('mdl-textfield');
    }
  ]
});
