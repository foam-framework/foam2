/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// source: http://s3.amazonaws.com/mhka_ensembles_production/assets/public/000/032/449/large/bluemonday.jpg

foam.CLASS({
  package: 'foam.demos.albums',
  name: 'BlueMonday6',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.RegularPolygon'
  ],

  properties: [
    [ 'width',  500 ],
    [ 'height', 500 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var s = 6, r = 0;
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius:167, arcWidth: 22, border: 'dodgerblue', shadowColor: 'dodgerblue', shadowBlur: 15, alpha: 0.6}));
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius:140, arcWidth: 5, border: 'deepskyblue'}));
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius:120-2.5, arcWidth: 15, border: 'darkgreen', shadowColor: 'green', shadowBlur: 15, alpha: 0.5}));
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius:65, arcWidth: 10, border: 'gray', shadowColor: 'gray', shadowBlur: 10}));
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius:50, arcWidth: 10, border: 'orange', shadowColor: 'orange', shadowBlur: 10, alpha: 0.5}));
      this.add(this.RegularPolygon.create({x:250, y:250, rotation: r, sides: s, radius: 28, color: 'red', border: null }));
    }
  ]
});
