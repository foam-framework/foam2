/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.foam.demos.bouncingballs',
  name: 'BouncingBalls',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.physics.PhysicalCircle',
    'foam.util.Timer'
  ],

  properties: [
    {
      name: 'timer',
      factory: function() {
        var timer = this.Timer.create();
        timer.start();
        return timer;
      }
    },
    [ 'n',          500 ],
    [ 'width',      800 ],
    [ 'height',     600 ],
    [ 'color', 'black' ],
    { name: 'engine',   factory: function() {
      return this.onDestroy(this.PhysicsEngine.create().start());
    }}
  ],

  methods: [
    function initCView() {
      this.SUPER();

      for ( var x = 0 ; x < this.n ; x++ ) {
        var c = this.PhysicalCircle.create({
          alpha: 0.2,
          radius: 20+Math.random() * 25,
          x: this.width * Math.random(),
          y: this.height * Math.random(),
          color: 'red',
          border: null
        }).setVelocityAndAngle(
          Math.sqrt(Math.random()) * 30 + 1,
          Math.random() * Math.PI * 2); 

        this.addChildren(c);

        this.timer.i$.sub(foam.Function.bind(function(c, i) {
          c.color = 'hsl(' + ( i ) + ',100%,50%)';
          if ( c.y < 0           ) c.vy =  Math.abs(c.vy);
          if ( c.y > this.height ) c.vy = -Math.abs(c.vy);
          if ( c.x < 0           ) c.vx =  Math.abs(c.vx);
          if ( c.x > this.width  ) c.vx = -Math.abs(c.vx);
          c.x += c.vx;
          c.y += c.vy;
        }, this, c, x));
      }
    }
  ]
});
