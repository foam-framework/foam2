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
          duration: 8000,
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
  extends: 'foam.physics.PhysicalCircle',

  requires: [
    'com.google.foam.demos.spacewars.Bullet',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.input.Gamepad'
  ],

  imports: [ 'addSprite' ],

  properties: [
    [ 'id', 0 ],
    [ 'radius', 15 ],
    [ 'border', 'white' ],
    [ 'shield', 999 ],
    {
      name: 'gamepad',
      factory: function() { return this.Gamepad.create({id: this.id}); }
    }
  ],

  methods: [
    function init() {
      var engine = this.Circle.create({
        radius: 7,
        color:  'red',
        border: null,
        x:      -this.radius+1,
        y:      0,
        start:  Math.PI/2,
        end:    Math.PI*3/2
      });
      this.add(engine);

      var gun = this.Box.create({
        width: 8,
        height: 4,
        color:  'white',
        border: null,
        x:      this.radius+1,
        y:      -2
      });
      this.add(gun);
    },

    function collideWith(c) {
      if ( this.Bullet.isInstance(c) ) {
        if ( c.color != this.color ) this.shield--;
        c.detach();
      }
    },

    function thrust() {
      this.applyMomentum(0.25, -this.rotation);
    },

    function turnLeft() {
      this.rotation += 1 * Math.PI/180;
    },

    function turnRight() {
      this.rotation -= 1 * Math.PI/180;
    },

    function fire() {
      var b = this.Bullet.create({x: this.x, y: this.y, color: this.color});
      b.applyMomentum(3 * b.mass, -this.rotation);
      this.applyMomentum(-0.01, this.rotation);
      b.x += b.vx * this.radius/2;
      b.y += b.vy * this.radius/2;
      this.addSprite(b);
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function() {
        this.gamepad.update();
        if ( this.gamepad.button0 ) this.thrust();
        if ( this.gamepad.button1 ) this.turnRight();
        if ( this.gamepad.button3 ) this.turnLeft();
        if ( this.gamepad.button4 ) this.fire();
        if ( this.gamepad.button5 ) this.fire();
      }
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

      // Apply Gravity
      var dx = c.x - star.x, dy = c.y - star.y;
      var dsquared = Math.max(star.radius * star.radius, dx * dx + dy * dy);
      c.applyMomentum(-750 * c.mass / dsquared, this.angleOfImpact(this.star, c));
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
      name: 'star',
      factory: function() { return this.PhysicalCircle.create({border: null, color: 'yellow', radius: 70, mass: 1000}); }
    },
    {
      name: 'lShip',
      factory: function() { return this.Ship.create({color: 'blue'}); }
    },
    {
      name: 'rShip',
      factory: function() { return this.Ship.create({id: 1, color: 'orange', rotation: Math.PI}); }
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

      var lScoreLabel = this.Label.create({
        text$:  this.lShip.shield$.map((s) => 'Shield: ' + s.toString().padStart(3, '0')),
        align:  'center',
        x:      170,
        y:      25,
        color:  'blue',
        font:   '50px Arial',
        width:  0,
        height: 70});

      var rScoreLabel = this.Label.create({
        text$:  this.rShip.shield$.map((s) => 'Shield: ' + s.toString().padStart(3, '0')),
        align:  'center',
        x:      this.canvas.width-170,
        y:      25,
        color:  'orange',
        font:   '50px Arial',
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
      this.collider.onTick.sub(this.lShip.tick);
      this.collider.onTick.sub(this.rShip.tick);

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
        // Add friction
        this.lShip.velocity *= 0.99;
        this.rShip.velocity *= 0.99;

        // Reset scores
        if ( this.lScore <= 0 || this.rScore <= 0 ) {
          // this.gameOver();
          this.lScore = this.rScore = 0;
        }
      }
    }
  ]
});
