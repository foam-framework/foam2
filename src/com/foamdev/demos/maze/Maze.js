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
        class: 'foam.u2.view.RadioView',
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
  name: 'Door',
  extends: 'foam.graphics.Box',
  properties: [
    [ 'color', 'red' ]
  ]
});

foam.CLASS({
  package: 'com.foamdev.demos.maze',
  name: 'Wall',
  extends: 'foam.graphics.Box',
  properties: [
    [ 'color', 'gray' ]
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
    'com.foamdev.demos.maze.Door',
    'com.foamdev.demos.maze.Wall',
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
      [true, true, true, true, 'door', true, true, true, true, true, true],
      [true, null, null, true, null, true, null, null, true],
      [null, 'door', null, null, null, null, null, true, null, true, true],
      [null, true, true, null, true, true, true, null, true, true, true],
      [null, null, true, true, true, null, true, true, null, true, true],
      [null, null, 'door', true, null, 'door', null, null, null, true],
      [true, 'door', null, true, null, null, null, null, true, null, true],
      [true, true, null, true, true, null, null, 'door', null, true],
      [true, null, true, true, null, true, null, null, true, null, true],
      [null, null, true, null, true, null, true, null, null, true, true],
      [null, true, true, true, true, true, true, null, true, null, true],
      ['door', true, true, true, true, true, true, true, true, true, true]
    ],
    MAZE_VERT: [
      [true, null, true, null, null, true, true, true, true, null, true, true],
      [true, true, true, true, true, null, true, true, null, true, null, true],
      [true, null, null, true, null, true, null, null, true, null, null, true],
      [true, true, null, null, null, null, null, true, null, null, null, true],
      [true, true, true, null, null, true, null, null, true, true, null, true],
      [true, true, null, null, true, null, true, true, true, null, true, true],
      [true, null, null, true, null, 'door', true, true, null, true, null, true],
      [true, null, true, null, null, null, true, true, true, null, true, 'door'],
      [true, true, null, null, true, true, null, true, true, null, null, true],
      [true, true, null, true, null, null, null, true, null, true, null, true],
      [true, null, null, null, null, null, null, null, true, null, false, true]
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
          color: '#222',
          width: 500, // window.innerWidth,
          height: 500 // window.innerHeight
        });
      }
    },
    {
      name: 'robot',
      factory: function() {
//        return this.Robot.create({x:37.5, y:435, scaleX: 0.4, scaleY: 0.4});
        return this.Robot.create({x:10, y:480, scaleX: 0.4, scaleY: 0.4, width: 4, height: 4});
      }
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    },
    'lastX', 'lastY', 'hittingWall'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.buildMaze();
      this.addChild(this.robot);

      this.gamepad.pressed.sub('button4', () => this.fire());
      this.gamepad.pressed.sub('button5', () => this.fire());

      // Setup Physics
      this.collider.collide = function(o1, o2) {
        if ( o2 == this.robot ) {
          o2 = o1;
          o1 = this.robot;
        }
        if ( o1 == this.robot ) {
          if ( this.Door.isInstance(o2) ) {
            console.log('*************************** Door');
          } else if ( this.Wall.isInstance(o2) ) {
            console.log('*************************** Wall');
            this.hittingWall = true;
          }
        }
      }.bind(this);
      this.collider.start();
      this.timer.i$.sub(this.tick);
      this.timer.start();
    },

    function buildMaze() {
      var m = this.MAZE_HORIZ;

      // draw horizontal lines
      for ( var row = 0 ; row < m.length ; row++ ) {
        var rowdata = m[row];
        for ( var col = 0 ; col < rowdata.length ; col++ ) {
          if ( rowdata[col] ) {
            var blockType = rowdata[col] == 'door' ? this.Door : this.Wall;
            this.addChild(blockType.create({
              x: this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y: this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width: this.BRICK_SIZE,
              height: 3
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
            var blockType = rowdata[col] == 'door' ? this.Door : this.Wall;
            this.addChild(blockType.create({
              x: this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y: this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width: 3,
              height: this.BRICK_SIZE
            }));
          }
        }
      }

    },

    function initE() {
      this.SUPER();
      this.focus();
      this.style({display:'flex'}).add(this.table).add(' ',this.Question2.create());
    },

    function gameOver() {
      if ( this.isGameOver ) return;
      this.isGameOver = true;

      this.timer.stop();
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
      code: function() {
        if ( this.hittingWall ) {
          this.robot.x = this.lastX;
          this.robot.y = this.lastY;
          this.hittingWall = false;
        } else {
          this.lastX = this.robot.x;
          this.lastY = this.robot.y;
        }

        if ( this.gamepad.button0 ) this.up();
        if ( this.gamepad.button1 ) this.right();
        if ( this.gamepad.button2 ) this.down();
        if ( this.gamepad.button3 ) this.left();
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
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
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
      code: function() {
        this.Laser.create({x: this.robot.x, y: this.robot.y, vx: 1, vy: 0});
        this.Laser.create({x: this.robot.x, y: this.robot.y, vx: 0, vy: 1});
        this.Laser.create({x: this.robot.x, y: this.robot.y, vx: -1, vy: 0});
        this.Laser.create({x: this.robot.x, y: this.robot.y, vx: 0, vy: -1});
      }
    }
  ]
});
