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
  package: 'foam.demos.bouncingballs',
  name: 'FastCircle',
  extends: 'foam.physics.PhysicalCircle',

  methods: [
    function paint(x) {
      this.maybeInitCView(x);
      x.fillStyle = this.color;
      x.beginPath();
      x.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      x.fill();
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.bouncingballs',
  name: 'BouncingBalls',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.demos.bouncingballs.FastCircle as PhysicalCircle',
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
    [ 'n',       1000 ],
    [ 'width',   1200 ],
    [ 'height',  500 ],
    [ 'color',   'black' ],
    [ 'autoRepaint', false ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var hsl = foam.Function.memoize1(function(h) {
        return 'hsl(' + h + ',100%,50%)';
      });

      for ( var i = 0 ; i < this.n ; i++ ) {
        var c = this.PhysicalCircle.create({
          radius: 10+20*Math.random(),
          x: this.width  * Math.random(),
          y: this.height * Math.random(),
          vx: 2 + Math.random()*10,
          vy: 2 + Math.random()*10,
          border: null
        });

        this.add(c);

        this.timer.i$.sub(foam.Function.bind(function(c, i) {
          c.color = hsl((i*347%180+this.timer.i*2)%360);
          var x = c.x, y = c.y;
          if ( y < 0           ) c.vy =  Math.abs(c.vy);
          if ( y > this.height ) c.vy = -Math.abs(c.vy);
          if ( x < 0           ) c.vx =  Math.abs(c.vx);
          if ( x > this.width  ) c.vx = -Math.abs(c.vx);
          c.x += c.vx;
          c.y += c.vy;
        }, this, c, i));
      }

      this.timer.i$.sub(this.invalidated.pub);
    }
  ]
});
