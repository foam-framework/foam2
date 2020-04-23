/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: use friction
// base Animation and Collider off of same Timer

 foam.CLASS({
    package: 'com.google.foam.demos.spacewars',
    name: 'Bullet',
    extends: 'foam.physics.PhysicalCircle',

    requires: [
     'foam.animation.Animation'
    ],

    imports: [ 'addSprite' ],

    properties: [
     [ 'color',  'white' ],
     [ 'radius', 3 ],
     [ 'mass',   0.05 ],
     [ 'border', null ]
    ],

    methods: [
      function init() {
        this.SUPER();

        this.addSprite(this);
        this.onDetach(this.Animation.create({
          duration: 10000,
          f: () => {
           this.x += 3000 * this.vx;
           this.y += 3000 * this.vy;
          },
          onEnd: () => this.detach(),
          objs: [ this ]
        }).start());
      },

      function collideWith(o) {
        /*
        if( this.cls_.isInstance(o) && o.color !== this.color ) {
          this.detach();
          o.detach();
        }
        */
      }
    ]
 });


foam.CLASS({
  package: 'com.google.foam.demos.spacewars',
  name: 'Ship',
  extends: 'foam.physics.PhysicalBox',

  requires: [
    'com.google.foam.demos.spacewars.Bullet',
    'foam.graphics.Circle'
  ],

  imports: [ 'addSprite' ],

  properties: [
    [ 'width',  50 ],
    [ 'height', 10 ],
    [ 'border', 'white' ]
  ],

  methods: [
    function init() {
      var engine = this.Circle.create({
        radius: 5,
        color:  'red',
        border: null,
        x:      0,
        y:      5,
        start:  Math.PI/2,
        end:    Math.PI*3/2
      });
      this.add(engine);
    },

    function thrust() {
      this.applyMomentum(0.25, -this.rotation);
    },

    function turnLeft() {
      this.rotation += 2 * Math.PI/180;
    },

    function turnRight() {
      this.rotation -= 2 * Math.PI/180;
    },

    function fire() {
      var b = this.Bullet.create({x: this.x, y: this.y-this.height/2, color: this.color});
      b.applyMomentum(3 * b.mass, -this.rotation);
      this.applyMomentum(-0.01, this.rotation);
      //b.x += b.vx * 45;
      //b.y += b.vy * 45;
      this.addSprite(b);
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.spacewars',
  name: 'GravityEngine',
  extends: 'foam.physics.PhysicsEngine',

  requires: [
    'com.google.foam.demos.spacewars.Bullet',
    'com.google.foam.demos.spacewars.Ship'
  ],

  imports: [ 'star' ],

  methods: [
    function updateChild(c) {
      this.SUPER(c);

      if ( this.Ship.isInstance(c) ) return;

      var star = this.star;

      if ( c == star ) return;

      var dx = c.x - star.x, dy = c.y - star.y;
      var dsquared = Math.max(star.radius * star.radius, dx * dx + dy * dy);

      c.applyMomentum(-1000 * c.mass / dsquared, this.angleOfImpact(this.star, c));
    },
    function collide(c1, c2) {
      if ( this.Bullet.isInstance(c1) && this.Bullet.isInstance(c1) ) return;
      this.SUPER(c1, c2);
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.spacewars',
  name: 'SpaceWar',
  extends: 'foam.u2.Element',

  documentation: 'Classic SpaceWars videogame. Use two gamepads to play.',

  requires: [
    'com.google.foam.demos.spacewars.Bullet',
    'com.google.foam.demos.spacewars.GravityEngine',
    'com.google.foam.demos.spacewars.Ship',
    'foam.audio.Beep',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.graphics.Label',
    'foam.input.Gamepad',
    'foam.physics.PhysicalCircle'
  ],

  exports: [
    'addSprite', 'star'
  ],

  constants: {
    PADDLE_SPEED: 10
  },

  properties: [
    {
      name: 'canvas',
      factory: function() { return this.Box.create({width: 1200, height: 600, color: 'black'}); }
    },
    {
      name: 'lGamepad',
      factory: function() { return this.Gamepad.create(); }
    },
    {
      name: 'rGamepad',
      factory: function() { return this.Gamepad.create({id: 1}); }
    },
    {
      name: 'star',
      factory: function() { return this.PhysicalCircle.create({border: null, color: 'yellow', radius: 70, mass: 1000}); }
    },
    {
      name: 'lShip',
      factory: function() { return this.Ship.create({color: 'blue'}); }
    },
    {
      name: 'rShip',
      factory: function() { return this.Ship.create({color: 'orange', rotation: Math.PI}); }
    },
    {
      class: 'Int',
      name: 'lScore'
    },
    {
      class: 'Int',
      name: 'rScore'
    },
    {
      name: 'collider',
      factory: function() { return this.GravityEngine.create({bounceOnWalls: true, bounds: this.canvas}); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.star.x = this.canvas.width/2;
      this.star.y = this.canvas.height/2;
      this.star.collideWith = (c) => {
        if ( this.Bullet.isInstance(c) ) {
          c.detach();
        }
      };

      this.lShip.collideWith = (c) => {
        if ( this.Bullet.isInstance(c) && c.color != this.lShip.color ) {
          this.rScore++;
          c.detach();
        }
      };
      this.rShip.collideWith = (c) => {
        if ( this.Bullet.isInstance(c) && c.color != this.rShip.color ) {
          this.lScore++;
          c.detach();
        }
      };

      var lScoreLabel = this.Label.create({
        text$:  this.lScore$.map((s) => s.toString().padStart(3, '0')),
        align:  'center',
        x:      170,
        y:      25,
        color:  'blue',
        font:   '70px Arial',
        width:  0,
        height: 70});

      var rScoreLabel = this.Label.create({
        text$:  this.rScore$.map((s) => s.toString().padStart(3, '0')),
        align:  'center',
        x:      this.canvas.width-170,
        y:      25,
        color:  'orange',
        font:   '70px Arial',
        width:  0,
        height: 70});

      this.canvas.add(
          this.star,
          lScoreLabel,
          rScoreLabel,
          this.lShip,
          this.rShip);

      // Position Ships
      this.lShip.x = 50;
      this.rShip.x = this.canvas.width-50;
      this.lShip.y = this.rShip.y = this.canvas.height/2;

      // We could make a foam.util.Timer, but the collider already has a timer
      // so just subscribe to its tick instead.
      this.collider.onTick.sub(this.tick);

//      this.ball.collideWith = (o) => this.onBounceOnShip();

      this.collider.add(this.star, this.lShip, this.rShip).start();
    },

    function addSprite(c) {
      this.canvas.add(c);
      if ( c.intersects ) this.collider.add(c);
      c.onDetach(() => {
        this.canvas.remove(c);
        if ( c.intersects ) this.collider.remove(c);
      });
    },

    function onBounceOnWall() {
      this.Beep.create({duration: 60, type: 'sine', frequency: 220, envelope: true, attack: 5, decay: 5}).play();
    },

    function onBounceOnShip() {
      this.Beep.create({duration: 70, type: 'sine', frequency: 330, envelope: true, attack: 5, decay: 5}).play();
    },

    function onScore() {
      this.Beep.create({duration: 320, frequency: 180, envelope: true, attack: 5, decay: 5}).play();
    },

    function initE() {
      this.SUPER();
      this.style({outline: 'none'}).focus().add(this.canvas);
    }
  ],

  actions: [
    {
      name: 'lThrust',
      keyboardShortcuts: [ 'w' ],
      code: function() { this.lShip.thrust(); }
    },
    {
      name: 'lLeft',
      keyboardShortcuts: [ 'a' ],
      code: function() { return this.lShip.turnLeft(); }
    },
    {
      name: 'lRight',
      keyboardShortcuts: [ 'd' ],
      code: function() { return this.lShip.turnRight(); }
    },
    {
      name: 'lFire',
      keyboardShortcuts: [ 's' ],
      code: function() { return this.lShip.fire(); }
    },

    {
      name: 'rThrust',
      keyboardShortcuts: [ 38 /* up arrow */ ],
      code: function() { this.rShip.thrust(); }
    },
    {
      name: 'rLeft',
      keyboardShortcuts: [ 37 /* left arrow */ ],
      code: function() { return this.rShip.turnLeft(); }
    },
    {
      name: 'rRight',
      keyboardShortcuts: [ 39 /* right arrow */ ],
      code: function() { return this.rShip.turnRight(); }
    },
    {
      name: 'rFire',
      keyboardShortcuts: [ 40 /* down arrow */ ],
      code: function() { return this.rShip.fire(); }
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function() {
        //  this.lShip.fire();
        //this.rShip.fire();

        this.lShip.velocity *= 0.99;
        this.rShip.velocity *= 0.99;

        this.lGamepad.update();
        if ( this.lGamepad.button0 ) this.lUp();
        if ( this.lGamepad.button2 ) this.lDown();

        this.rGamepad.update();
        if ( this.rGamepad.button0 ) this.rUp();
        if ( this.rGamepad.button2 ) this.rDown();

        // Reset scores
        if ( this.lScore >= 1000 || this.rScore >= 1000 ) {
          this.lScore = this.rScore = 0;
        }
      }
    }
  ]
});
