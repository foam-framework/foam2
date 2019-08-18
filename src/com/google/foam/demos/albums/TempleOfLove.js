/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.albums',
  name: 'TempleOfLove',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.Line'
  ],

  properties: [
    [ 'width',  600 ],
    [ 'height', 500 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      for ( var r = 0 ; r < Math.PI*2 ; r += Math.PI/80 ) {
        this.add(this.Line.create({
          startX: 180 + 50 * Math.cos(r),
          startY: 150 + 50 * Math.sin(r),
          endX: 180 + 700 * Math.cos(r),
          endY: 150 + 700 * Math.sin(r),
          color:'green'
        }));
      }
    }
  ]
});
