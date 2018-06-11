// Cartesian Robot
// by: Sebastian Greer
// May 27, 2018

foam.CLASS({
  package: 'com.google.foam.demos.cartesian',
  name: 'Cartesian',
  extends: 'foam.graphics.Box',

  requires: [ 'foam.graphics.Line' ],

  properties: [
    [ 'borderWidth', 0 ],
    [ 'width', 600 ],
    [ 'height', 500 ],
    [ 'color', 'white' ]
  ],

  methods: [
    function start(x, y) {
      this.x = x;
      this.y = y;
    },

    function line(x, y) {
      this.add(this.Line.create({
        startX:300+this.x*10,
        startY:200-this.y*10,
        endX: 300+x*10,
        endY: 200-y*10,
        color: 'black'}));
      this.x = x;
      this.y = y;
    },

    function part() {
      this.start(arguments[0], arguments[1]);
      for ( var i = 2 ; i < arguments.length ; i+=2 )
        this.line(arguments[i], arguments[i+1]);
    },

    function initCView() {
      // Draw the X and Y axes
      this.start(-25,0); this.line(25,0);
      this.start(0,-25); this.line(0,25);

      for ( var i = -25 ; i <= 25 ; i++ ) {
        this.part(-0.3, i, 0.3, i);
        this.part(i, -0.3, i, 0.3);
      }

      this.start(-6, 7);
      this.line(-7, 8);
      this.line(-7, 14);
      this.line(-6,15);
      this.line(6,15);
      this.line(7,14);
      this.line(7,8);
      this.line(6,7);
      this.line(-6,7);

      this.start(-6,8);
      this.line(-6,14);
      this.line(6,14);
      this.line(6,8);
      this.line(-6,8);

      this.start(-3,11);
      this.line(-3,12);
      this.line(-2,12);
      this.line(-2,11);
      this.line(-3,11);

      this.start(2,11);
      this.line(2,12);
      this.line(3,12);
      this.line(3,11);
      this.line(2,11);

       this.start(-3,9);
       this.line(-3,10);
       this.line(3,10);
       this.line(3,9);
       this.line(-3,9);

       this.start(-1,7);
       this.line(-1,6);
       this.line(-2,5);
       this.line(-4,5);
       this.line(-5,4);
       this.line(-5,-6);
       this.line(-4,-7);
       this.line(4,-7);
       this.line(5,-6);
       this.line(5,4);
       this.line(4,5);
       this.line(2,5);
       this.line(1,6);
       this.line(1,7);

       this.start(0,3);
       this.line(1,4);
       this.line(2,4);
       this.line(3,3);
       this.line(3,2);
       this.line(2,0);
       this.line(0,-1);
       this.line(-2,0);
       this.line(-3,2);
       this.line(-3,3);
       this.line(-2,4);
       this.line(-1,4);
       this.line(0,3);

       this.start(-3,-4);
       this.line(-4,-3);
       this.line(-3,-2);
       this.line(-2,-2);
       this.line(-1,-3);
       this.line(0,-2);
       this.line(1,-3);
       this.line(2,-2);
       this.line(3,-2);
       this.line(4,-3);
       this.line(3,-4);
       this.line(2,-4);
       this.line(-3,-4);

       this.start(-3,-4);
       this.line(-4,-5);
       this.line(-3,-6);
       this.line(-2,-6);
       this.line(-1,-5);
       this.line(0,-6);
       this.line(1,-5);
       this.line(2,-6);
       this.line(3,-6);
       this.line(4,-5);
       this.line(3,-4);
       this.line(2,-4);
       this.line(1,-5);
       this.line(0,-4);
       this.line(-1,-5);
       this.line(-2,-4);

       this.start(-2,-4);
       this.line(-1,-3);
       this.line(-2,-4);
       this.line(2,-4);
       this.line(1,-3);
       this.line(0,-4);
       this.line(-1,-3);

       this.part(-5,4,-6,4,-6,1,-5,1);
       this.part(-6, 3, -7, 3, -6, 1, -8, 2, -7, 3);
       this.part(5,4,6,4,6,1,5,1);
       this.part(6,3,7,3,6,1,8,2,7,3);
       this.part(-8,2,-8,0,-6,0,-6,1,-8,1);
       this.part(-6,0,-6,-4,-8,-4,-8,-3,-6,-3);
       this.part(-8,-3,-8,-2,-6,-2);
       this.part(-8,-2,-8,-1,-6,-1);
       this.part(-8,0,-8,-1);
       this.part(8,2,8,0,6,0,6,1,8,1);
       this.part(6,0,6,-4,8,-4,8,-3,6,-3);
       this.part(8,-3,8,-2,6,-2);
       this.part(8,-2,8,-1,6,-1);
       this.part(8,-1,8,0);
       this.part(-8,-4,-9,-5,-8,-7,-7,-7,-8,-5,-7,-5,-6,-6,-5,-6,-6,-4);
       this.part(8,-4,9,-6,8,-7,7,-7,8,-6,8,-5,7,-5,6,-6,5,-6,6,-5,6,-4);
       this.part(-4,-7,-3,-8,-3,-16,-4,-17,0,-17,-1,-16,-1,-8,0,-7,1,-8,1,-16,0,-17,4,-17,3,-16,3,-8,4,-7);
       this.part(-3,-8,-1,-8);
       this.part(-3,-9,-1,-9);
       this.part(-3,-10,-1,-10);
       this.part(-3,-11,-1,-11);
       this.part(-3,-12,-1,-12);
       this.part(-3,-13,-1,-13);
       this.part(-3,-14,-1,-14);
       this.part(-3,-15,-1,-15);
       this.part(-3,-16,-1,-16);
       this.part(1,-8,3,-8);
       this.part(1,-9,3,-9);
       this.part(1,-10,3,-10);
       this.part(1,-11,3,-11);
       this.part(1,-12,3,-12);
       this.part(1,-13,3,-13);
       this.part(1,-14,3,-14);
       this.part(1,-15,3,-15);
       this.part(1,-16,3,-16);
       this.part(-4,-17,-4,-18,4,-18,4,-17);
       this.part(0,-17,0,-18);
       this.part(-2,15,-1,16,1,16,2,15);
       this.part(0,16,0,17,-1,18,0,19,1,18,0,17);
    }
  ]
});
