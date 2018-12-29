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
            if ( this.x < 0 ) {
              this.remove();
              return;
            }
            this.x--;
            this.y--;
            this.width  += 2;
            this.height += 2;
            this.tick();
          }
        }
      ]
    }
  ],

  properties: [
    [ 'i',         0   ],
    [ 'width',     720 ],
    [ 'height',    720 ],
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
        if ( this.i++ % 20 == 0 ) {
          this.add(this.Square.create({
            x:      this.width/2,
            y:      this.height/2,
            width:  1,
            height: 1,
            color:  this.hsl(this.i, 100, 50),
            border: 'white'
          }));
        }
        this.invalidated.pub();
        this.tick();
      }
    }
  ]
});
