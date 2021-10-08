 /**
  * @license
  * Copyright 2018 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

foam.CLASS({
  package: 'foam.demos.squares',
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
            if ( this.x < 350 ) { this.alpha *= 0.988;}
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
    [ 'width',     900 ],
    [ 'height',    900 ],
    [ 'fillStyle', 'black' ],
    [ 'color',     'black' ],
    [ 'frequency', 1 ],
    { class: 'Boolean', name: 'inColour',  value: true },
    [ 'rotationPerSquare', 1/45 ],
  ],

  methods: [
    function initCView() {
      this.tick();
    }
  ],

  actions: [
    {
      name: 'settings1',
      code: function() {
        this.inColour          = true;
        this.rotationPerSquare = 0;
        this.frequency         = 20;
      }
    },
    {
      name: 'settings2',
      code: function() {
        this.inColour          = true;
        this.rotationPerSquare = 1/45;
        this.frequency         = 3;
      }
    },
    {
      name: 'settings3',
      code: function() {
        this.inColour          = true;
        this.rotationPerSquare = 1/45;
        this.frequency         = 1;
      }
    },
    {
      name: 'settings4',
      code: function() {
        this.inColour          = false;
        this.rotationPerSquare = 1/45;
        this.frequency         = 1;
      }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( this.i++ % this.frequency == 0 ) {
          this.add(this.Square.create({
            x:      this.width/2,
            y:      this.height/2,
            rotation: this.i * this.rotationPerSquare,
            color:  this.inColour ? this.hsl(this.i, 100, 40) : null,
            border: 'white'
          }));
        }
        this.invalidated.pub();
        this.tick();
      }
    }
  ]
});
