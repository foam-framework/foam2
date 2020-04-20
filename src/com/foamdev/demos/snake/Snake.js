/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO:
//  Add sound affects.

foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Scale',
  extends: 'foam.graphics.Circle',

  requires: [ 'foam.animation.Animation' ],

  imports: [ 'game', 'snake' ],

  properties: [ [ 'color', 'green' ] ],

  methods: [
    function init() {
      var age = this.snake.age;

      this.snake.exploded$.sub(() => this.explode());

      var l = this.snake.age$.sub(() => {
        if ( this.snake.age - age >= this.snake.length ) {
          this.game.removeChild(this);
          l.detach();
        }
      });
    },
    function explode() {
      this.Animation.create({
        duration: 2000,
        f: () => {
          this.x += Math.random()*4000-2000;
          this.y += Math.random()*4000-2000;
        },
        objs: [ this ]
      }).start();
    }
  ],
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Snake',
  extends: 'foam.graphics.Circle',

  requires: [
    'com.foamdev.demos.snake.Laser',
    'com.foamdev.demos.snake.Scale',
    'foam.animation.Animation'
  ],

  imports: [ 'game', 'timer' ],

  exports: [ 'as snake' ],

  properties: [
    [ 'color',    'red' ],
    [ 'x',        240 ],
    [ 'y',        240 ],
    [ 'vx',       1 ],
    [ 'vy',       0 ],
    [ 'length',   0 ],
    [ 'exploded', false ],
    [ 'age',      0 ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.timer.i$.sub(this.tick);
    },
    function up()    { this.vy = -1; this.vx =  0; },
    function down()  { this.vy =  1; this.vx =  0; },
    function left()  { this.vy =  0; this.vx = -1; },
    function right() { this.vy =  0; this.vx =  1; },
    function fire () {
      this.Laser.create({x: this.x, y: this.y, vx: this.vx, vy: this.vy});
    },
    function explode() {
      this.exploded = true;
    }
  ],

  listeners: [
    {
      name: 'tick',
      // only run every 85ms, otherwise game runs too fast
      isMerged: true,
      mergeDelay: 85,
      code: function() {
        this.age++;

        if ( this.length )
          this.game.addChild(this.Scale.create({x: this.x, y: this.y, radius: this.radius}));

        this.x += this.vx * this.radius*2;
        this.y += this.vy * this.radius*2;
      }
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Food',
  extends: 'foam.graphics.Circle',

  requires: [ 'foam.animation.Animation' ],

  imports: [ 'game' ],

  properties: [
    [ 'color',  'darkblue' ],
    [ 'radius', 12 ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.Animation.create({
        duration: 10000,
        f:        ()=> this.radius = 4,
        onEnd:    () => this.game.removeChild(this),
        objs:     [this]
      }).start();
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Mushroom',
  extends: 'foam.graphics.Circle',

  requires: [
    'foam.graphics.Box',
    'foam.animation.Animation'
  ],

  imports: [ 'game' ],

  properties: [
    [ 'radius',   20 ],
    [ 'color',    'gray' ],
    [ 'start',    Math.PI ],
    [ 'end',      0 ],
    [ 'exploded', false ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.add(this.Box.create({
        x:      -7.5,
        y:      -0.5,
        width:  15,
        height: 20,
        color:  'gray'
      }));
    },

    function explode() {
      if ( this.exploded ) return;
      this.exploded = true;

      this.Animation.create({
        duration: 600,
        f: ()=> {
          this.scaleX   = this.scaleY = 8;
          this.alpha    = 0;
          this.rotation = Math.PI * 6;
        },
        onEnd: () => this.game.removeChild(this),
        objs: [this]
      }).start();
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Laser',
  extends: 'foam.graphics.Circle',

  requires: [
    'com.foamdev.demos.snake.Mushroom',
    'foam.animation.Animation'
  ],

  imports: [ 'game'],

  properties: [
    [ 'color', 'yellow' ],
    [ 'radius', 12 ],
    'vx',
    'vy'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.game.addChild(this);
      this.Animation.create({
        duration: 4000,
        f: () => {
          this.x += 3000 * this.vx;
          this.y += 3000 * this.vy;
        },
        onEnd: () => this.game.removeChild(this),
        objs: [ this ]
      }).start();
    },

    function collideWith(o) {
      if ( this.Mushroom.isInstance(o) ) {
        o.explode();
        this.game.removeChild(o);
      }
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Game',
  extends: 'foam.u2.Element',

  requires: [
    'com.foamdev.demos.snake.Food',
    'com.foamdev.demos.snake.Laser',
    'com.foamdev.demos.snake.Mushroom',
    'com.foamdev.demos.snake.Snake',
    'com.foamdev.demos.snake.Scale',
    'foam.animation.Animation',
    'foam.audio.Speak',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.graphics.Label',
    'foam.input.Gamepad',
    'foam.physics.Collider',
    'foam.util.Timer'
  ],

  exports: [
    'timer',
    'as game'
  ],

  constants: { R: 20 },

  properties: [
    [ 'width',  1600 ],
    [ 'height', 800 ],
    {
      name: 'gamepad',
      factory: function() { return this.Gamepad.create(); }
    },
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      name: 'snake',
      factory: function() { return this.Snake.create({radius: this.R}); }
    },
    {
      name: 'highScore',
      factory: function() { return localStorage.snakeHighScore == "null" ? 0 : localStorage.snakeHighScore; },
      postSet: function(_, score) { localStorage.snakeHighScore = score; }
    },
    {
      name: 'table',
      factory: function() {
        return this.Box.create({
          color:  'lightblue',
          width:  window.innerWidth,
          height: window.innerHeight
        });
      }
    },
    {
      name: 'inBounds',
      factory: function() {
        return this.Box.create({
          x: 2*this.R,
          y: 2*this.R,
          width: this.table.width-4*this.R-1,
          height: this.table.height-4*this.R-1})
        }
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.timer.i$.sub(this.tick);
      this.timer.start();

      this.gamepad.pressed.sub('button4', () => this.fire());
      this.gamepad.pressed.sub('button5', () => this.fire());

      this.addChild(this.snake);

      this.addChild(this.Label.create({
        text$:  this.highScore$.map((score)=>'High Score: ' + score),
        color:  'white',
        scaleX: 5,
        scaleY: 5,
        x:      25,
        y:      25
      }));

      this.addChild(this.Label.create({
        text$:   this.snake.length$.map((l)=>'Score: ' + l),
        color:  'white',
        scaleX: 5,
        scaleY: 5,
        x:      this.table.width-250,
        y:      25
      }));

      // Snake Collisions
      this.snake.collideWith = (o) => {
        if ( this.Mushroom.isInstance(o) ) {
          // Only die from fully grown mushrooms
          if ( o.scaleX == 1 ) {
            this.snake.explode();
            o.explode();
            this.gameOver();
          } else {
            this.removeChild(o);
          }
        } else if ( this.Food.isInstance(o) ) {
          this.removeChild(o);
          if ( this.snake.length++ > this.highScore ) this.highScore = this.snake.length;
        } else if ( this.Scale.isInstance(o) ) {
          this.gameOver();
        }
      };

      this.collider.start();
    },

    function initE() {
      this.SUPER();
      // Set focus to receive keyboard input
      this.focus().style({display:'flex', outline: 'none'}).add(this.table);
    },

    function gameOver() {
      this.timer.stop();
      this.collider.stop();

      this.table.color = 'orange';
      this.addChild(this.Label.create({
        text:   'Game Over',
        align:  'center',
        color:  'white',
        scaleX: 10,
        scaleY: 10,
        x:      this.table.width/2,
        y:      this.table.height/2-100
      }));

      this.Speak.create({text: 'Game Over'}).play();
    },

    function addChild(c) {
      this.table.add(c);
      if ( c.intersects ) this.collider.add(c);
    },

    function removeChild(c) {
      this.table.remove(c);
      if ( c.intersects ) this.collider.remove(c);
    },

    function addFood() {
      var R = this.R;
      var f = this.Food.create({
        x: Math.round(1+Math.random()*(this.table.width -4*R)/R)*2*R,
        y: Math.round(1+Math.random()*(this.table.height-4*R)/R)*2*R,
      });
      this.addChild(f);
    },

    function addMushroom() {
      var R = this.R;
      var m = this.Mushroom.create({
        x:      Math.round(1+Math.random()*(this.table.width -4*R)/R)*2*R,
        y:      Math.round(1+Math.random()*(this.table.height-4*R)/R)*2*R,
        scaleX: 0.1,
        scaleY: 0.1});

      this.Animation.create({
        duration: 3000,
        f:        ()=> { m.scaleX = 1; m.scaleY = 1; },
        onEnd:    () => m.color = 'red',
        objs:     [m]
      }).start();

      this.addChild(m);
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function(_, __, ___, t) {
        // Detect snake running of the edge of the screen
        if ( ! this.snake.intersects(this.inBounds) )
          this.gameOver();

        if ( this.gamepad.button0 ) this.up();
        if ( this.gamepad.button1 ) this.right();
        if ( this.gamepad.button2 ) this.down();
        if ( this.gamepad.button3 ) this.left();

        if ( t.get() % 30 == 0 ) this.addFood();
        if ( Math.random() < 0.02 ) this.addMushroom();
      }
    }
  ],

  actions: [
    {
      name: 'up',
      keyboardShortcuts: [ 38 /* up arrow */, 'w' ],
      code: function() { this.snake.up(); }
    },
    {
      name: 'down',
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
      code: function() { this.snake.down(); }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 37 /* left arrow */, 'a' ],
      code: function() { this.snake.left(); }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 39 /* right arrow */, 'd' ],
      code: function() { this.snake.right(); }
    },
    {
      name: 'fire',
      keyboardShortcuts: [ ' ', 'x' ],
      code: function() { this.snake.fire(); }
    }
  ]
});
