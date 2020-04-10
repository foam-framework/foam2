/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.input',
  name: 'Gamepad',

  imports: [ 'timer' ],

  topics: [ 'pressed' ],

  properties: [
    {
      name: 'id',
      value: 0
    },
    { class: 'Boolean', name: 'button0' },
    { class: 'Boolean', name: 'button1' },
    { class: 'Boolean', name: 'button2' },
    { class: 'Boolean', name: 'button3' },
    { class: 'Boolean', name: 'button4' },
    { class: 'Boolean', name: 'button5' },
    { class: 'Boolean', name: 'button6' },
    { class: 'Boolean', name: 'button7' },
    { class: 'Boolean', name: 'button8' },
    { class: 'Boolean', name: 'button9' }
  ],

  methods: [
    function init() {
      if ( this.timer ) this.timer.i$.sub(this.update);
    }
  ],

  listeners: [
    function update() {
      var gp = navigator.getGamepads()[this.id];
      if ( gp ) {
        for ( var i = 0 ; i < 10 ; i++ ) {
          var pressed = gp.buttons[i].pressed;
          var button  = 'button' + i;
          if ( pressed && ! this[button] ) {
            this.pressed.pub(button);
          }
          this[button] = pressed;
        }
      } else {
        for ( var i = 0 ; i < 10 ; i++ ) {
          this['button' + i] = false;
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Question1',
  properties: [
    {
      name: 'question',
      label: 'Who was the best Star Wars robot?',
      view: {
        class: 'foam.u2.view.ChoiceView',
        class: 'foam.u2.view.RadioView',
        placeholder: 'Please select',
        choices: [
          'C3-PO',
          'R2-D2',
          'BB-8',
          'K-2SO'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'R2-D2'
    }
  ]
});

foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Question2',
  properties: [
    {
      name: 'question',
      label: 'Which of the following do robots make',
      view: {
        class: 'foam.u2.view.ChoiceView',
//        class: 'foam.u2.view.RadioView',
        placeholder: 'Please select',
        choices: [
          'Cars',
          'Washing Machines',
          'Computers',
          'Robots',
          'All of the Above'

        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'All of the Above'
    }
  ]
});


foam.CLASS({
  package: 'foam.movement',
  name: 'Animation',

  // TODO: add support for interpolating colours
  properties: [
    {
      class: 'Int',
      name: 'duration',
      units: 'ms',
      value: 1000
    },
    {
      name: 'f',
    },
    {
      class: 'Array',
      name: 'objs'
    },
    {
      name: 'onEnd',
      value: function() {}
    },
    {
      name: 'startTime_'
    },
    {
      class: 'Map',
      name: 'slots_'
    }
  ],

  methods: [
    function start() {
      var self    = this;
      var cleanup = foam.core.FObject.create();

      this.objs.forEach(function(o) {
        cleanup.onDetach(o.propertyChange.sub(self.propertySet));
      });

      this.f();

      cleanup.detach();

      this.startTime_ = Date.now();

      this.animateValues();
      this.tick();
    },

    function animateValues() {
      for ( var key in this.slots_ ) {
        var s          = this.slots_[key];
        var slot       = s[0], startValue = s[1], endValue = s[2];
        var completion = Math.min(1, (Date.now() - this.startTime_) / this.duration);
        var value      = startValue + (endValue-startValue) * completion;
        slot.set(value);
      }
    }
  ],

  listeners: [
    {
      name: 'propertySet',
      code: function(_, __, __, slot) {
        if ( this.slots_[slot] ) return;

        var oldValue = slot.getPrev(), newValue = slot.get();

        if ( ! foam.Number.isInstance(oldValue) || Number.isNaN(oldValue) ) return;

        this.slots_[slot] = [ slot, oldValue, newValue ];
      }
    },
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        this.animateValues();

        if ( Date.now() < this.startTime_ + this.duration ) {
          this.tick();
        } else {
          this.onEnd();
        }
      }
    }
  ]
});


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
    'com.foamdev.demos.snake.Scale',
    'com.foamdev.demos.snake.Laser'
  ],

  imports: [
    'game',
    'timer',
    'R'
  ],

  properties: [
//    { name: 'scales', factory: function() { return []; } },
    [ 'sx', 240 ],
    [ 'sy', 240 ],
    [ 'vx', 1/5 ],
    [ 'vy', 0 ],
    [ 'length', 5 ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.timer.i$.sub(this.tick);
    },
    function up()    { this.vy = -1/5; this.vx =  0; },
    function down()  { this.vy =  1/5; this.vx =  0; },
    function left()  { this.vy =  0; this.vx = -1/5; },
    function right() { this.vy =  0; this.vx =  1/5; },
    function fire () {
      this.Laser.create({x: this.sx, y: this.sy, vx: this.vx, vy: this.vy});
    },
    function intersects(o) {
      if ( ! this.children.length ) return false;
      return this.children[this.children.length-1].intersects(o);
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: 150,
      code: function() {
        this.sx += this.vx * 2 * this.R;
        this.sy += this.vy * 2 * this.R;
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

  requires: [ 'foam.movement.Animation' ],

  imports: [ 'game' ],

  properties: [
    [ 'color', 'darkblue' ],
    [ 'radius', 10 ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.Animation.create({
        duration: 5000,
        f: ()=> this.radius = 0,
        onEnd: () => this.game.removeChild(this),
        objs: [this]
      }).start();
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Mushroom',
  extends: 'foam.graphics.Circle',

  requires: [ 'foam.graphics.Box', 'foam.movement.Animation' ],

  imports: [ 'game' ],

  properties: [
    [ 'radius', 20 ],
    [ 'color',  'red' ],
    [ 'start',  Math.PI ],
    [ 'end',    0 ],
    'stem',
    [ 'exploded', false ]
  ],

  methods: [
    function init() {
      this.SUPER();

      this.add(this.stem = this.Box.create({
        x: -7.5,
        y: -0.5,
        width: 15,
        height: 20,
        color: 'gray'
      }));
    },

    function explode() {
      if ( this.exploded ) return;
      this.exploded = true;

      this.stem.background = 'red';

      this.Animation.create({
        duration: 600,
        f: ()=> {
          this.scaleX     = this.scaleY = 10;
          this.alpha      = 0;
          this.rotation   = Math.PI * 6;
        },
        onEnd: () => this.game.removeChild(this),
        slots: [ this.scaleX$, this.scaleY$, this.alpha$, this.rotation$ ],
        objs: [this, this.stem]
      }).start();
    }
  ]
});


foam.CLASS({
  package: 'com.foamdev.demos.snake',
  name: 'Laser',
  extends: 'foam.graphics.Circle',

  requires: [ 'foam.movement.Animation' ],
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
        duration: 5000,
        f: () => {
          this.x += 2000 * this.vx;
          this.y += 2000 * this.vy;
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
    'com.foamdev.demos.snake.Question1',
    'com.foamdev.demos.snake.Question2',
    'com.foamdev.demos.snake.Snake',
    'com.google.foam.demos.robot.Robot',
    'foam.graphics.Box as Rectangle',
    'foam.graphics.CView',
    'foam.input.Gamepad',
    'foam.movement.Movement',
    'foam.physics.Collider',
    'foam.util.Timer'
  ],

  exports: [
    'R',
    'timer',
    'as game',
    'movement'
  ],

  constants: { R: 20 },

  properties: [
    {
      name: 'gamepad',
      factory: function() { return this.Gamepad.create(); }
    },
    {
      name: 'movement',
      factory: function() { return this.Movement.create(); }
    },
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    [ 'width', 1600 ],
    [ 'height', 800 ],
    {
      name: 'snake',
      factory: function() { return this.Snake.create(); }
    },
    {
      name: 'table',
      factory: function() {
        return this.Rectangle.create({
          color: 'lightblue',
          width: 800, //window.innerWidth,
          height: 500, //window.innerHeight
        });
      }
    },
    {
      name: 'robot',
      factory: function() {
        return this.Robot.create({x:200, y:200});
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

//      this.addChild(this.collider);

      this.timer.i$.sub(this.tick);
      this.timer.start();

      this.gamepad.pressed.sub('button4', () => this.fire());
      this.gamepad.pressed.sub('button5', () => this.fire());

//      this.gamepad.pressed.sub('button1', () => robot.x+=10);
      this.gamepad.pressed.sub(function() { console.log('pressed', arguments); });

      this.addChild(this.robot);
      this.addChild(this.snake);

      // Setup Physics
      this.collider.collide = function(o1, o2) {
        if ( this.Laser.isInstance(o2) || this.Snake.isInstance(o2) ) {
          var tmp = o1;
          o1 = o2;
          o2 = tmp;
        }
        if ( this.Laser.isInstance(o1) ) {
          if ( this.Mushroom.isInstance(o2) ) {
            o2.explode();
          } else if ( this.Food.isInstance(o2) ) {
          }
        }
        if ( this.Snake.isInstance(o1) && this.Mushroom.isInstance(o2) ) {
          if ( o2.scaleX == 1 )
            this.gameOver();
          else
            this.removeChild(o2);
        }
        if ( this.Snake.isInstance(o1) && this.Food.isInstance(o2) ) {
          this.removeChild(o2);
          this.snake.length++;
        }
//        console.log('BANG', o1, o2);
      }.bind(this);
      this.collider.start();
    },

    function initE() {
      this.SUPER();
      this.focus();
      this.style({display:'flex'}).add(this.table).add(this.Question2.create());
    },

    function gameOver() {
      this.timer.stop();
//      this.collider.stop(); // TODO: add stop() method to collider
      this.table.background='orange';
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
return;
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
        x: Math.round(1+Math.random()*(this.table.width -4*R)/R)*2*R,
        y: Math.round(1+Math.random()*(this.table.height-4*R)/R)*2*R,
        scaleX: 1,
        scaleY: 1});

        /*
        TODO
      this.movement.animate(7000, function() {
        m.scaleX = m.scaleY = 1;
      })();
      */

      this.addChild(m);
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function(_, __, ___, t) {
        if ( this.gamepad.button0 ) this.robot.y -= 3;
        if ( this.gamepad.button1 ) this.robot.x += 3;
        if ( this.gamepad.button2 ) this.robot.y += 3;
        if ( this.gamepad.button3 ) this.robot.x -= 3;

        if ( t.get() % 10 == 0 ) this.addFood();
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
