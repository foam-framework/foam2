/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Robot',
  extends: 'foam.graphics.CView',

  // author: Sebastian Greer (age 11)

  implements: [ 'foam.physics.Physical' ],

  imports: [ 'timer' ],

  requires: [
   'foam.graphics.Box',
   'foam.graphics.Circle'
  ],

  properties: [
    [ 'width',  25 ],
    [ 'height', 45 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      // Build the Robot
      var body = this.Box.create({
        x:      -10,
        width:  20,
        height: 25,
        color:  '#ccc'
      });
      this.add(body);

      var neck = this.Box.create({
        color:  'white',
        width:  2,
        y:      -13,
        x:      9,
        height: 15
      });
      body.add(neck);

      var head = this.Circle.create({
        radius: 10,
        color:  'orange',
        x:      0,
        y:      -5
      });
      neck.add(head);

      var engine = this.Circle.create({
        radius: 8,
        color:  'red',
        border: null,
        x:      10,
        y:      25.5,
        start:  0,
        end:    Math.PI
      });
      body.add(engine);

      var engine2 = this.Circle.create({
        radius: 4,
        color:  'orange',
        border: null,
        x:      10,
        y:      25.5,
        start:  0,
        end:    Math.PI
      });
      body.add(engine2);

      var eye = this.Circle.create({
        radius: 7,
        color:  'white'
      });
      head.add(eye);

      var pupil = this.Circle.create({
        radius: 3,
        color:  'lightblue'
      });
      eye.add(pupil);

      // animate
      var timer = this.timer;
      timer.time$.sub(function() {
        var t = timer.time/16;

        // Animate parts of the robot
        body.y        = 5 * Math.cos(t/9) - 15;
        body.rotation = Math.PI / 12 * Math.cos(t/40);
        pupil.x       = 4 * Math.cos(t/15);
        neck.height   = 15 + 6 * Math.cos(t/15);
        neck.y        = -13 - 6 * Math.cos(t/15);
        engine.alpha  = 0.9 - Math.sin(t/2) / 10;
        engine2.alpha = 0.8 - Math.sin(t/3) / 5;
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question1',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'Who created JavaScript?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Elon Musk',
          'Brendan Eich',
          'Mich Chung',
          'Cha Min'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'Brendan Eich'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question2',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'What company was JavaScript invented in?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Redknee',
          'Verizon',
          'NASA',
          'Netscape Communications'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'Netscape Communications'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question3',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'What computer language was JavaScript coded in?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'C++',
          'C#',
          'French',
          'Java'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'C++'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question4',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'Is JavaScript a compiled language or an interpreted language?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Interpreted',
          'Compiled'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'Interpreted'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question5',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'What is the main purpose of JavaScript?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Video Games',
          'Animation',
          'Mobile software',
          'Web development'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'Web development'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question6',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'How long does it take to become adequate in JavaScript on average?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          '1 month',
          '2 months',
          '4 months',
          '6 months'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: '1 month'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question7',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'Which one of these famous apps were made using JavaScript?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Netlix',
          'Facebook',
          'Candy Crush',
          'All of the above'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'All of the above'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question8',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'When was JavaScript invented?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          '1985',
          '1990',
          '1995',
          '2001'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: '1995'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Question9',
  label: 'Question',
  properties: [
    {
      name: 'question',
      label: 'What was JavaScript\'s first name?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'NetScript',
          'C67',
          'Swarrovski',
          'Mocha'
        ]
      }
    },
    {
      name: 'answer',
      hidden: true,
      value: 'Mocha'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Door',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.animation.Animation',
    'foam.audio.Speak'
  ],

  imports: [ 'game' ],

  properties: [
    [ 'color',    'red' ],
    [ 'isClosed', true ],
    'question'
  ],

  methods: [
    function open() {
      this.isClosed = false;
      this.Animation.create({
        duration: 1000,
        f:        () => this.rotation = Math.PI / 4,
        objs:     [ this ],
        interp: foam.animation.Interp.oscillate(0.8, 0.3)
      }).start();
    },

    function connectToQuestion(q) {
      this.question = q;

      q.question$.sub(() => {
        if ( q.question == q.answer ) {
          // Open door if correct answer
          this.open();
          this.Speak.create({text: "Correct!"}).play();
        } else {
          // Put robot back to starting location if wrong
          this.game.resetRobotLocation();
          this.Speak.create({text: "Wrong! Back to the beginning for you."}).play();
        }

        // Remove the question
        this.game.question = null;
        this.game.focus();
      });
    },

    function askQuestion() {
      this.game.question = this.question;
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Wall',
  extends: 'foam.graphics.Box',
  properties: [
    [ 'color', 'gray' ]
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Exit',
  extends: 'foam.graphics.Box',
  properties: [
    [ 'color', 'blue' ]
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Bullet',
  extends: 'foam.graphics.Circle',

  requires: [ 'foam.animation.Animation' ],

  imports: [ 'addSprite' ],

  properties: [
    [ 'color', 'yellow' ],
    [ 'radius', 4 ],
    'vx',
    'vy'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.addSprite(this);
      this.Animation.create({
        duration: 4000,
        f: () => {
          this.x += 1500 * this.vx;
          this.y += 1500 * this.vy;
        },
        onEnd: () => this.detach,
        objs: [ this ]
      }).start();
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.maze',
  name: 'Game',
  extends: 'foam.u2.Element',

  documentation: 'Javascript quiz canvas game.',

  requires: [
    'foam.demos.maze.Door',
    'foam.demos.maze.Exit',
    'foam.demos.maze.Bullet',
    'foam.demos.maze.Question1',
    'foam.demos.maze.Question2',
    'foam.demos.maze.Question3',
    'foam.demos.maze.Question4',
    'foam.demos.maze.Question5',
    'foam.demos.maze.Question6',
    'foam.demos.maze.Question7',
    'foam.demos.maze.Question8',
    'foam.demos.maze.Question9',
    'foam.demos.maze.Robot',
    'foam.demos.maze.Wall',
    'foam.animation.Animation',
    'foam.audio.Speak',
    'foam.graphics.Box',
    'foam.graphics.Label',
    'foam.input.Gamepad',
    'foam.physics.Collider',
    'foam.util.Timer'
  ],

  exports: [
    'timer',
    'addSprite',
    'as game'
  ],

  constants: {
    BRICK_SIZE: 40,
    MAZE_HORIZ: [
      ['Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall'],
      ['Wall',   null,   null, 'Wall',   null, 'Wall',   null,   null, 'Wall',   null,   null],
      [  null,   null,   null,   null,   null,   null,   null, 'Wall',   null, 'Wall', 'Wall'],
      [  null, 'Wall', 'Wall', 'Door', 'Wall', 'Wall', 'Wall',   null, 'Wall', 'Wall',   null],
      [  null,   null, 'Wall', 'Wall', 'Wall',   null, 'Wall', 'Wall',   null, 'Wall', 'Wall'],
      [  null,   null, 'Wall', 'Wall',   null, 'Door',   null,   null,   null, 'Wall',   null],
      ['Wall', 'Door', 'Wall', 'Wall',   null,   null,   null, 'Door', 'Wall',   null, 'Wall'],
      ['Wall', 'Wall',   null, 'Wall', 'Wall', 'Door',   null,   null,   null, 'Wall',   null],
      ['Wall',   null, 'Wall', 'Wall',   null, 'Wall',   null,   null, 'Wall', 'Door', 'Wall'],
      [  null,   null, 'Wall',   null, 'Wall',   null, 'Wall', 'Wall',   null, 'Wall', 'Wall'],
      [  null, 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall',   null, 'Wall',   null, 'Wall'],
      ['Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall', 'Wall']
    ],
    MAZE_VERT: [
      ['Wall',   null, 'Wall',   null,   null, 'Wall', 'Wall', 'Wall',   null,   null, 'Wall', 'Exit'],
      ['Wall', 'Wall', 'Wall', 'Wall', 'Wall',   null, 'Wall', 'Wall',   null, 'Wall',   null, 'Wall'],
      ['Wall',   null,   null, 'Wall',   null, 'Wall',   null, 'Door', 'Wall', 'Door',   null, 'Wall'],
      ['Wall', 'Wall',   null,   null, 'Wall',   null,   null, 'Wall',   null,   null,   null, 'Wall'],
      ['Wall', 'Wall', 'Wall',   null,   null, 'Wall',   null,   null, 'Wall', 'Wall',   null, 'Wall'],
      ['Wall', 'Wall',   null,   null, 'Wall',   null, 'Wall', 'Wall', 'Wall',   null, 'Wall', 'Wall'],
      ['Wall',   null,   null, 'Wall',   null,   null, 'Wall', 'Wall', 'Wall', 'Wall',   null, 'Wall'],
      ['Wall',   null, 'Wall',   null,   null,   null, 'Wall', 'Wall',   null,   null, 'Wall', 'Wall'],
      ['Wall', 'Wall',   null,   null, 'Wall', 'Wall',   null, 'Wall', 'Wall',   null,   null, 'Wall'],
      ['Wall', 'Wall',   null, 'Wall',   null,   null,   null, 'Wall',   null, 'Wall',   null, 'Wall'],
      ['Wall',   null,   null,   null,   null,   null,   null, 'Door', 'Wall',   null,  false, 'Wall']
    ]
   },

  properties: [
    [ 'width',  1600 ],
    [ 'height', 800 ],
    {
      // Joystick
      name: 'gamepad',
      factory: function() { return this.Gamepad.create(); }
    },
    {
      // Timer used to tick every frame to cause game to run
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      // Canvas object used to draw graphics on.
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          color:  'black',
          scaleX: 2,
          scaleY: 1.8,
          width:  500,
          height: 500
        });
      }
    },
    {
      name: 'robot',
      factory: function() {
        return this.Robot.create({scaleX: 0.5, scaleY: 0.5, width: 3, height: 3});
      }
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    },

    // Last non-wall-hitting location
    'lastX',
    'lastY',

    // True if robot currently hitting a wall
    'hittingWall',

    // Current question being asked
    'question'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.buildMaze();
      this.addSprite(this.robot);
      this.resetRobotLocation();

      // Setup collision detection
      this.robot.collideWith = (o) => {
        if ( this.Door.isInstance(o) ) {
          if ( o.isClosed ) {
            this.hittingWall = true;
            o.askQuestion();
          }
        } else if ( this.Wall.isInstance(o) ) {
          this.hittingWall = true;
        } else if ( this.Exit.isInstance(o) ) {
          this.gameOver();
        }
      };

      // Start Timer and Collider
      this.collider.start();
      this.timer.start();
      this.timer.i$.sub(this.tick);
    },

    function resetRobotLocation() {
      // Reset the robot's location at start of game or when user gets
      // a question wrong.
      this.robot.x = 37.5;
      this.robot.y = 435;
    },

    function buildMaze() {
      // Build the canvas, including doors and the exit

      var doorNumber = 1;
      var m          = this.MAZE_HORIZ;

      // Add horizontal lines
      for ( var row = 0 ; row < m.length ; row++ ) {
        var rowdata = m[row];
        for ( var col = 0 ; col < rowdata.length ; col++ ) {
          if ( rowdata[col] ) {
            var blockType = this[rowdata[col]];
            var block     = blockType.create({
              x:      this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y:      this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width:  this.BRICK_SIZE,
              height: 5
            });
            if ( rowdata[col] == 'Door' ) {
              block.connectToQuestion(this['Question' + doorNumber].create());
              doorNumber = doorNumber+1;
            }
            this.addSprite(block);
          }
        }
      }

      // Add vertical lines
      m = this.MAZE_VERT;
      for ( var row = 0 ; row < m.length ; row++ ) {
        var rowdata = m[row];
        for ( var col = 0 ; col < rowdata.length ; col++ ) {
          if ( rowdata[col] ) {
            var blockType = this[rowdata[col]];
            var block     = blockType.create({
              x:      this.BRICK_SIZE/2 + col*this.BRICK_SIZE,
              y:      this.BRICK_SIZE/2 + row*this.BRICK_SIZE,
              width:  5,
              height: this.BRICK_SIZE+5
            });
            if ( rowdata[col] == 'Door' ) {
              block.connectToQuestion(this['Question' + doorNumber].create());
              doorNumber = doorNumber+1;
            }
            this.addSprite(block);
          }
        }
      }
    },

    function initE() {
      this.SUPER();

      // Set focus so arrow keys work
      this.focus();

      // Create the HTML
      this.style({display: 'flex', outline: 'none'}).add(this.canvas, ' ', this.question$);
    },

    function gameOver() {
      // Call when user reaches the exit and the game is over

      this.collider.stop();

      this.canvas.color = 'white';

      var label = this.Label.create({
        text:  'You Win!',
        align: 'center',
        color: 'red',
        x:     this.canvas.width/2,
        y:     180
      });
      this.addSprite(label);

      this.Animation.create({
        duration: 2000,
        f: ()=> {
          label.scaleX      = label.scaleY = 10;
          label.rotation    = 2 * Math.PI;
          this.robot.scaleX = this.robot.scaleY = 5;
          this.robot.x      = this.canvas.width/2;
          this.robot.y      = this.canvas.height/2;
        },
        objs: [label, this.robot]
      }).start();

      this.Speak.create({text: "You Win! You're so smart! You're a JavaScript master!"}).play();
    },

    function addSprite(c) {
      this.canvas.add(c);
      if ( c.intersects ) this.collider.add(c);
      c.onDetach(() => {
        this.canvas.remove(c);
        if ( c.intersects ) this.collider.remove(c);
      });
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function() {
        // If hitting a wall, move robot back to last good position
        if ( this.hittingWall ) {
          this.robot.x     = this.lastX;
          this.robot.y     = this.lastY;
          this.hittingWall = false;
        } else {
          // If not hitting a wall, record this position
          this.lastX = this.robot.x;
          this.lastY = this.robot.y;
        }

        // Check for joystick controls
        if ( this.gamepad.button0 ) this.up();
        if ( this.gamepad.button1 ) this.right();
        if ( this.gamepad.button2 ) this.down();
        if ( this.gamepad.button3 ) this.left();
        if ( this.gamepad.button4 ) this.fire();
        if ( this.gamepad.button5 ) this.fire();
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
        // Fire four lasers, one in each direction
        this.Bullet.create({x: this.robot.x, y: this.robot.y, vx:  1, vy:  0});
        this.Bullet.create({x: this.robot.x, y: this.robot.y, vx:  0, vy:  1});
        this.Bullet.create({x: this.robot.x, y: this.robot.y, vx: -1, vy:  0});
        this.Bullet.create({x: this.robot.x, y: this.robot.y, vx:  0, vy: -1});
      }
    }
  ]
});
