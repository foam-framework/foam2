/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'com.google.foam.demos.pong',
  name: 'Ball',
  extends: 'foam.physics.PhysicalCircle'
});


foam.CLASS({
  package: 'com.google.foam.demos.pong',
  name: 'Paddle',
  extends: 'foam.graphics.Arc',

  implements: [ 'foam.physics.Physical' ],

  properties: [
    [ 'radius', 80 ],
    [ 'border', 'white' ],
    [ 'color',  null ],
    [ 'arcWidth', 10 ],
    {
      name: 'mass',
      factory: function() { return this.INFINITE_MASS; }
    }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.pong',
  name: 'Pong',
  extends: 'foam.u2.Element',

  requires: [
    'com.google.foam.demos.pong.Ball',
    'com.google.foam.demos.pong.Paddle',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.graphics.Label',
    'foam.physics.PhysicsEngine'
  ],

  constants: {
    PADDLE_SPEED: 10
  },

  properties: [
    {
      name: 'canvas',
      factory: function() { return this.Box.create({width: 1200, height: 600, color: 'lightgray'}); }
    },
    {
      name: 'ball',
      factory: function() { return this.Ball.create({border: null, color: 'white', radius: 20}); }
    },
    {
      name: 'lPaddle',
      factory: function() { return this.Paddle.create({end:Math.PI/2, start:-Math.PI/2}); }
    },
    {
      name: 'rPaddle',
      factory: function() { return this.Paddle.create({start:Math.PI/2, end:-Math.PI/2}); }
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
      factory: function() { return this.PhysicsEngine.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var lScoreLabel = this.Label.create({
        text$:  this.lScore$,
        align:  'center',
        x:      this.canvas.width/2-120,
        y:      25,
        color:  'white',
        font:   '70px Arial',
        width:  0,
        height: 70});

      var rScoreLabel = this.Label.create({
        text$:  this.rScore$,
        align:  'center',
        x:      this.canvas.width/2+100,
        y:      25,
        color:  'white',
        font:   '70px Arial',
        width:  0,
        height: 70});

      this.canvas.add(
          this.Box.create({x: this.canvas.width/2-5, width:10, height: this.canvas.height, border:'rgba(0,0,0,0)' , color: 'white'}),
          this.ball,
          lScoreLabel,
          rScoreLabel,
          this.lPaddle,
          this.rPaddle);

      // Position Paddles
      this.lPaddle.x = 25;
      this.rPaddle.x = this.canvas.width-25-this.rPaddle.width;
      this.lPaddle.y = this.rPaddle.y = (this.canvas.height-this.rPaddle.height)/2;

      // Setup Ball
      this.ball.x  = 210;
      this.ball.y  = this.rPaddle.y;
      this.ball.vx = this.ball.vy = 10;

      this.collider.onTick.sub(this.onBallMove);

      // Setup Physics
      this.collider.add(this.ball, this.lPaddle, this.rPaddle).start();
    },

    function initE() {
      this.SUPER();
      this.style({outline: 'none'}).focus().add(this.canvas);
    }
  ],

  actions: [
    {
      name: 'lUp',
      keyboardShortcuts: [ 'q' ],
      code: function() { this.lPaddle.y -= this.PADDLE_SPEED; }
    },
    {
      name: 'lDown',
      keyboardShortcuts: [ 'a' ],
      code: function() { this.lPaddle.y += this.PADDLE_SPEED; }
    },
    {
      name: 'rUp',
      keyboardShortcuts: [ 38 /* up arrow */ ],
      code: function() { this.rPaddle.y -= this.PADDLE_SPEED; }
    },
    {
      name: 'rDown',
      keyboardShortcuts: [ 40 /* down arrow */ ],
      code: function() { this.rPaddle.y += this.PADDLE_SPEED; }
    }
  ],

  listeners: [
    {
      name: 'onBallMove',
      isFramed: true,
      code: function() {
        var ball = this.ball;

        // Make sure the ball doesn't go too slow horizontally
        if ( ball.vx > 0 && ball.vx < 5  ) ball.vx *= 1.1;
        if ( ball.vx < 0 && ball.vx > -5 ) ball.vx *= 1.1;

        // Make sure the ball doesn't go too fast
        if ( ball.velocity >  10 ) ball.velocity =  10;
        if ( ball.velocity < -10 ) ball.velocity = -10;

        // Bounce off of top wall
        if ( ball.y - ball.radius <= 0 ) {
          ball.vy *= -1;
        }
        // Bounce off of bottom wall
        if ( ball.y + ball.radius >= this.canvas.height ) {
          ball.vy *= -1;
        }
        // Bounce off of left wall
        if ( ball.x <= 0 ) {
          this.rScore++;
          ball.x = 150;
          ball.vx *= -1;
        }
        // Bounce off of right wall
        if ( ball.x >= this.canvas.width ) {
          this.lScore++;
          ball.x = this.canvas.width - 150;
          ball.vx *= -1;
        }
        // Reset scores
        if ( this.lScore == 100 || this.rScore == 100 ) {
          this.lScore = this.rScore = 0;
        }
      }
    }
  ]
});
