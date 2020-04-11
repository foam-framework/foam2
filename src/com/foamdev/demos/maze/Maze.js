/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.maze',
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
  package: 'com.foamdev.demos.maze',
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
  package: 'com.foamdev.demos.maze',
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
  package: 'com.foamdev.demos.maze',
  name: 'Game',
  extends: 'foam.u2.Element',

  requires: [
    'com.foamdev.demos.maze.Laser',
    'com.foamdev.demos.maze.Question1',
    'com.foamdev.demos.maze.Question2',
    'com.google.foam.demos.robot.Robot',
    'foam.animation.Animation',
    'foam.audio.Speak',
    'foam.graphics.Box as Rectangle',
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

  constants: {
    BRICK_SIZE: 40,
    MAZE_HORIZ: [
      [true,null,true,true,true,null,true,true,null,true,true],
      [true,null,null,true,null,true,null,null,true],
      [null,true,null,null,true && 0,null,null,true,null,true,true],
      [null,true,true,null,true,true,true,null,true,true,true],
      [null,null,true,true,true,null,true,true,null,true,true],
      [null,null,true,true,null,'door',null,null,null,true],
      [true,true,null,true,null,null,null,null,true,null,true],
      [true,true,null,true,true,null,null,true,null,true],
      [true,null,true,true,null,true,null,null,true,null,true],
      [null,null,true,null,true,null,true,null,null,true,true],
      [null,true,true,true,true,true,true,null,true,null,true],
      [true,true,true,true,true,true,true,true,true,true]
    ],
    MAZE_VERT: [
      [true,null,true,null,null,true,true,true,true,null,true,true],
      [true,true,true,true,true,null,true,true,null,true,null,true],
      [true,null,null,true,null,true,null,null,true],
      [true,true,null,null,null,null,null,true,null,null,null,true],
      [true,true,true,null,null,true,null,null,true,true,null,true],
      [null,true,null,null,true,null,true,true,true,null,true],
      [true,null,null,true,null,true,true,true,null,true,null,true],
      [null,null,true,null,null,null,true,true,true,null,true,true],
      [true,true,null,null,true,true,null,true,true,null,null,true],
      [true,true,null,true,null,null,null,true,null,true],
      [true,null,null,null,null,null,null,null,true,null,true,true]
    ]
   },

  properties: [
    [ 'isGameOver', false ],
    [ 'width', 1600 ],
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
      name: 'table',
      factory: function() {
        return this.Rectangle.create({
          color: 'lightblue',
          width: 500, // window.innerWidth,
          height: 500 // window.innerHeight
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

      this.buildMaze();

//      this.addChild(this.collider);

      this.timer.i$.sub(this.tick);
      this.timer.start();

      this.gamepad.pressed.sub('button4', () => this.fire());
      this.gamepad.pressed.sub('button5', () => this.fire());

//      this.gamepad.pressed.sub('button1', () => robot.x+=10);
      this.gamepad.pressed.sub(function() { console.log('pressed', arguments); });

      this.addChild(this.robot);

      // Setup Physics
      this.collider.collide = function(o1, o2) {
        /*
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
        */
//        console.log('BANG', o1, o2);
      }.bind(this);
      this.collider.start();
    },

    function buildMaze() {
      var m = this.MAZE_HORIZ;

      // draw horizontal lines
      for ( var row = 0 ; row < m.length ; row++ ) {
        var rowdata = m[row];
        for ( var col = 0 ; col < rowdata.length ; col++ ) {
          if ( rowdata[col] ) {
            this.addChild(this.Rectangle.create({
              color: rowdata[col] == 'door' ? 'blue' : 'red',
              x: this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y: this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width: this.BRICK_SIZE,
              height: rowdata[col] == 'door' ? 2 : 1
            }));
          }
        }
      }

      // draw vertical lines
      m = this.MAZE_VERT;
      for ( var row = 0 ; row < m.length ; row++ ) {
        var rowdata = m[row];
        for ( var col = 0 ; col < rowdata.length ; col++ ) {
          if ( rowdata[col] ) {
            this.addChild(this.Rectangle.create({
              color: rowdata[col] == 'door' ? 'blue' : 'red',
              x: this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y: this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width: rowdata[col] == 'door' ? 2 : 1,
              height: this.BRICK_SIZE
            }));
          }
        }
      }

    },

    function initE() {
      this.SUPER();
      this.focus();
      this.style({display:'flex'}).add(this.table).add(this.Question2.create());
    },

    function gameOver() {
      if ( this.isGameOver ) return;
      this.isGameOver = true;

      this.timer.stop();
//      this.collider.stop(); // TODO: add stop() method to collider
      this.table.color = 'orange';
      this.addChild(this.Label.create({
        text: 'Game Over',
        align: 'center',
        color: 'white',
        scaleX: 10,
        scaleY: 10,
        x: this.table.width/2,
        y: 100
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
      }
    }
  ],

  actions: [
    {
      name: 'up',
      keyboardShortcuts: [ 38 /* up arrow */, 'w' ],
      code: function() { this.robot.y -= 3; }
    },
    {
      name: 'down',
      keyboardShortcuts: [ this.BRICK_SIZE /* down arrow */, 's' ],
      code: function() { this.robot.y += 3; }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 37 /* left arrow */, 'a' ],
      code: function() { this.robot.x -= 3; }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 39 /* right arrow */, 'd' ],
      code: function() { this.robot.x += 3; }
    },
    {
      name: 'fire',
      keyboardShortcuts: [ ' ', 'x' ],
      code: function() { this.robot.fire(); }
    }
  ]
});
