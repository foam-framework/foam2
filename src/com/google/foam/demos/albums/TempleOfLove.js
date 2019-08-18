/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.albums',
  name: 'TempleOfLove',
  extends: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Arc' ],

  properties: [
    [ 'width',  500 ],
    [ 'height', 500 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
    }
  ]
});
