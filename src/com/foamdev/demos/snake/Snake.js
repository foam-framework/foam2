/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Scale',
  extends: 'foam.graphics.Circle',
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Snake',
  extends: 'foam.graphics.CView',

  requires: [
    'com.foamdev.demos.snake.Laser',
    'com.foamdev.demos.snake.Scale',
    'foam.animation.Animation'
  ],

  imports: [
    'game',
    'timer',
    'R'
  ],

  properties: [
    [ 'sx',     240 ],
    [ 'sy',     240 ],
    [ 'vx',     1 ],
    [ 'vy',     0 ],
    [ 'length', 5 ]
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
      this.Laser.create({x: this.sx, y: this.sy, vx: this.vx, vy: this.vy});
    },
    function notIntersects(o) {
      return this.children.length && ! this.children[this.children.length-1].intersects(o);
    },
    function intersects(o) {
      return this.children.length && this.children[this.children.length-1].intersects(o);
    },
    function isSteppingOnTail() {
      for ( var i = 0 ; i < this.children.length-2 ; i++ )
        if ( this.intersects(this.children[i]) ) return true;
      return false;
    },
    function explode() {
      this.children.forEach((c) => {
        this.Animation.create({
          duration: 2000,
          f: () => {
            c.x += Math.random()*4000-2000;
            c.y += Math.random()*4000-2000;
          },
          objs: [ c ]
        }).start();
      });
    }
  ],

  listeners: [
    {
      name: 'tick',
      // only run every 85ms, otherwise game runs too fast
      isMerged: true,
      mergeDelay: 85,
      code: function() {
        this.sx += this.vx * this.R*2;
        this.sy += this.vy * this.R*2;

        if ( this.children.length )
          this.children[this.children.length-1].color = 'green';

        this.add(this.Scale.create({x: this.sx, y: this.sy, radius: this.R, color: 'red'}));

        if ( this.children.length > this.length )
          this.children.shift();
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

  requires: [ 'foam.animation.Animation' ],

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
    'R',
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
      factory: function() { return this.Snake.create(); }
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

      // this.gamepad.pressed.sub(function() { console.log('pressed', arguments); });

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
        text$:   this.snake.length$.map((l)=>'Score: ' + (l-5)),
        color:  'white',
        scaleX: 5,
        scaleY: 5,
        x:      this.table.width-250,
        y:      25
      }));

      // Collision Behaviour
      this.collider.collide = (o1, o2) => {
        if ( this.Laser.isInstance(o2) || this.Snake.isInstance(o2) ) {
          var tmp = o1;
          o1 = o2;
          o2 = tmp;
        }
        if ( this.Laser.isInstance(o1) ) {
          if ( this.Mushroom.isInstance(o2) ) {
            o2.explode();
            this.removeChild(o1);
          } else if ( this.Food.isInstance(o2) ) {
          }
        } else if ( this.Snake.isInstance(o1) ) {
          if ( this.Mushroom.isInstance(o2) ) {
            // Only die from fully grown mushrooms
            if ( o2.scaleX == 1 ) {
              o1.explode();
              this.gameOver();
            } else {
              this.removeChild(o2);
            }
          } else if ( this.Food.isInstance(o2) ) {
            this.removeChild(o2);
            if ( this.snake.length++ > this.highScore ) this.highScore = this.snake.length-5;
          } else if ( this.Scale.isInstance(o2) ) {
            this.gameOver();
          }
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
        if ( this.snake.notIntersects(this.inBounds) || this.snake.isSteppingOnTail() )
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
