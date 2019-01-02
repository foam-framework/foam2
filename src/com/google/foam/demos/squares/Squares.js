 /**
  * @license
  * Copyright 2018 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

foam.CLASS({
  package: 'com.google.foam.demos.squares',
  name: 'Squares',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'Square',
      extends: 'foam.graphics.Box',
      methods: [
        function initCView() {
          this.tick();
        }
      ],
      listeners: [
        {
          name: 'tick',
          isFramed: true,
          code: function() {
            if ( this.x < 350 ) { this.alpha *= 0.99;}
            if ( this.x < -100 ) {
              this.parent.remove(this);
              return;
            }
            this.x--;
            this.y--;
            this.width  += 2;
            this.height += 2;
            this.originX = this.width / 2;
            this.originY = this.height / 2;
            this.tick();
          }
        }
      ]
    }
  ],

  properties: [
    [ 'i',         0   ],
    [ 'width',     800 ],
    [ 'height',    800 ],
    [ 'fillStyle', 'black' ],
    [ 'color',     'black' ]
  ],

  methods: [
    function initCView() {
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( this.i++ % 1 == 0 ) {
          this.add(this.Square.create({
            x:      this.width/2,
            y:      this.height/2,
            width:  1,
            height: 1,
            rotation: this.i/45,
            color:  this.hsl(this.i, 100, 40),
            border: 'white'
          }));
        }
        this.invalidated.pub();
        this.tick();
      }
    }
  ]
});
