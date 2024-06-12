/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Original: https://www.masswerk.at/spacewar/
foam.CLASS({
  package: 'foam.demos.spacewars',
  name: 'Ship',
  extends: 'foam.physics.PhysicalCircle',

  requires: [
    'foam.demos.spacewars.Bullet',
    'foam.animation.Animation',
    'foam.graphics.Arc',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.input.Gamepad'
  ],

  imports: [ 'addSprite', 'gameOver' ],

  properties: [
    [ 'id',     0 ],
    [ 'radius', 40 ],
    [ 'border', 'white' ],
    [ 'shield', 1000 ],
    {
      name: 'gamepad',
      factory: function() { return this.Gamepad.create({id: this.id}); }
    },
    'engine1', 'engine2', 'forcefield'
  ],

  methods: [
    function init() {
      this.engine1 = this.Circle.create({
        radius:      7,
        color:       'red',
        border:      null,
        x:           -this.radius+20,
        y:           -14,
        shadowColor: 'red',
        shadowBlur:  10,
        scaleX:      2
      });

      this.engine2 = this.Circle.create({
        radius:      7,
        color:       'red',
        border:      null,
        x:           -this.radius+20,
        y:           14,
        shadowColor: 'red',
        shadowBlur:  10,
        scaleX:      2
      });

      var hull = this.Circle.create({
        color:  this.color,
        radius: this.radius-24,
        border: 'gray',
        scaleX: 1.4
      });

      this.forcefield = this.Arc.create({
        start:       0,
        end:         Math.PI*2,
        radius:      this.radius,
        shadowBlur:  10,
        shadowColor: 'white',
        border:      'white',
        arcWidth:    8,
        alpha:       1
      });

      var gun = this.Box.create({
        width:  8,
        height: 4,
        color:  'white',
        border: null,
        x:      this.radius-15,
        y:      -2
      });

      this.add(this.engine1, this.engine2, hull, this.forcefield, gun);
    },

    function paintSelf() {},

    function collideWith(c) {
      if ( this.Bullet.isInstance(c) ) {
        if ( c.color != this.color ) {
          if ( this.shield == 10 ) {
            this.explode();
            this.gameOver(this.id + 1, this.color);
          }
          this.forcefield.alpha = Math.min(1.1, this.forcefield.alpha+0.25);
          this.shield = Math.max(0, this.shield-10);
        }
        c.detach();
      }
    },

    function thrust() {
      this.applyMomentum(0.25, -this.rotation);
      this.engine1.alpha = this.engine2.alpha = 1.5;
    },

    function turnLeft() {
      this.rotation += 2 * Math.PI/180;
      this.engine2.alpha = 1.2;
    },

    function turnRight() {
      this.rotation -= 2 * Math.PI/180;
      this.engine1.alpha = 1.2;
    },

    function fire() {
      var b = this.Bullet.create({x: this.x, y: this.y, color: this.color});
      b.applyMomentum(4 * b.mass, -this.rotation);
      this.applyMomentum(-0.01, this.rotation);
      b.x += b.vx * this.radius/3;
      b.y += b.vy * this.radius/3;
      this.addSprite(b);
    },

    function explode() {
      // TODO: add sound effect
      for ( var i = 0 ; i < 100 ; i++ ) {
        let c = this.Circle.create({
          x: Math.random() * 60 - 30,
          y: Math.random() * 60 - 30,
          color: 'rgba(255,' + Math.random()*255 + ',0)',
          radius: 0,
          border: null,
          alpha: 0.1
        });
        this.add(c);
        this.Animation.create({
          delay: Math.random() * 1000,
          duration: 1000,
          f: () => { c.radius = Math.random() * 150; c.x *= 2; c.y *= 2; },
          objs: [ c ],
          interp: Math.sqrt
        }).start();
      }
      this.Animation.create({
        duration: 2000,
        f: () => this.alpha = 0,
        objs: [ this ]
      }).start();
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
        if ( this.engine1.alpha > 0.4 ) this.engine1.alpha *= 0.95;
        if ( this.engine2.alpha > 0.4 ) this.engine2.alpha *= 0.95;
        this.forcefield.alpha *= 0.96;
      }
    }
  ]
});


foam.CLASS({
   package: 'foam.demos.spacewars',
   name: 'Bullet',
   extends: 'foam.physics.PhysicalCircle',

   requires: [
    'foam.animation.Animation'
   ],

   properties: [
    [ 'color',  'white' ],
    [ 'radius', 3 ],
    [ 'mass',   0.05 ],
    [ 'border', null ]
   ],

   methods: [
     function init() {
       this.SUPER();

       this.onDetach(this.Animation.create({
         duration: 15000,
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
  package: 'foam.demos.spacewars',
  name: 'GravityEngine',
  extends: 'foam.physics.PhysicsEngine',

  requires: [
    'foam.demos.spacewars.Bullet',
    'foam.demos.spacewars.Ship'
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
      var dsquared = dx * dx + dy * dy;
      c.applyMomentum(-4000 * c.mass / dsquared, this.angleOfImpact(this.star, c));
    },
    function collide(c1, c2) {
      if ( this.Bullet.isInstance(c1) && this.Bullet.isInstance(c1) ) return;
      this.SUPER(c1, c2);
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.spacewars',
  name: 'SpaceWar',
  extends: 'foam.u2.Element',

  documentation: 'Classic SpaceWars videogame. Use two gamepads to play.',

  requires: [
    'foam.demos.spacewars.Bullet',
    'foam.demos.spacewars.GravityEngine',
    'foam.demos.spacewars.Ship',
    'foam.animation.Animation',
    'foam.audio.Beep',
    'foam.audio.Speak',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.graphics.CView',
    'foam.graphics.Label',
    'foam.physics.PhysicalCircle'
  ],

  exports: [
    'addSprite', 'gameOver', 'star'
  ],

  constants: {
    PADDLE_SPEED: 10
  },

  properties: [
    {
      name: 'canvas',
      factory: function() { return this.Box.create({width: 1200, height: 800, color: 'black'}); }
    },
    {
      name: 'star',
      factory: function() { return this.PhysicalCircle.create({
        shadowBlur: 50,
        shadowColor: 'white',
        border: null,
        color: 'black',
        radius: 80,
        mass: 1000
      }); }
    },
    {
      name: 'lShip',
      factory: function() { return this.Ship.create({color: 'lightblue'}); }
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

      this.addStars();

      this.star.x = this.canvas.width/2;
      this.star.y = this.canvas.height/2;
      this.star.collideWith = (c) => {
        if ( this.Bullet.isInstance(c) ) {
          c.detach();
        }
      };

      var lScoreLabel = this.Label.create({
        text$:  this.lShip.shield$.map((s) => 'Shield: ' + (s/10)/*.toFixed(1)*/ + '%'),
        align:  'center',
        x:      200,
        y:      25,
        color:  'lightblue',
        font:   '50px Arial',
        width:  0,
        height: 70});

      var rScoreLabel = this.Label.create({
        text$:  this.rShip.shield$.map((s) => 'Shield: ' + (s/10)/*.toFixed(1)*/ + '%'),
        align:  'center',
        x:      this.canvas.width-200,
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

    function addStars() {
      for ( var i = 0 ; i < 512 ; i++ ) {
        this.canvas.add(this.Circle.create({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: 0.7 + 1 * Math.random(),
          border: null,
          color: 'white'
        }));
      }
    },

    function initE() {
      this.SUPER();
      this.style({outline: 'none'}).focus().add(this.canvas);
    },

    function gameOver(playerNumber, playerColor) {
      this.collider.stop();

      this.star.add(this.Label.create({
        text:        'Game Over',
        align:       'center',
        color:       'black',
        shadowColor: playerColor,
        shadowBlur:  20,
        y:           -12
      }));

      this.star.add(this.Label.create({
        text:        'Player ' + playerNumber + ' Wins!',
        align:       'center',
        color:       'black',
        shadowColor: playerColor,
        shadowBlur:  20,
        y:           0
      }));

      this.Animation.create({
        duration: 2000,
        f:        ()=> { this.star.scaleX = this.star.scaleY = 18; },
        objs:     [this.star]
      }).start();

      this.Speak.create({text: 'Game Over. Player ' + playerNumber + ' Wins!'}).play();
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
        this.lShip.velocity *= 0.996;
        this.rShip.velocity *= 0.996;
      }
    }
  ]
});
