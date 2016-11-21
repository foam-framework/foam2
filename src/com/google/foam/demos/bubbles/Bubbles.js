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
  package: 'com.google.foam.demos.bubbles',
  name: 'Bubbles',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.physics.PhysicalCircle',
    'foam.physics.PhysicsEngine',
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
    [ 'n',          7 ],
    [ 'width',      800 ],
    [ 'height',     600 ],
    [ 'background', '#ccf' ],
    { name: 'engine',   factory: function() {
      var e = this.PhysicsEngine.create({gravity: true});
      e.start();
      return this.onDestroy(e);
    }}
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var N = this.n;

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            radius: 15,
            x: 400+(x-(N-1)/2)*70,
            y: 200+(y-(N-1)/2)*70,
            arcWidth: 6,
            friction: 0.96,
            gravity: 0.03,
            border: this.hsl(x/N*100, (70+y/N*30), 60)
          });
          this.engine.add(c);
          this.add(c);

          this.timer.i$.sub(foam.Function.bind(function circleBoundOnWalls(c) {
            if ( c.y > 1/this.scaleY*this.height+50 ) {
              c.y = -50;
            }
            if ( c.x < 0          ) c.vx =  Math.abs(c.vx)+0.1;
            if ( c.x > this.width ) c.vx = -Math.abs(c.vx)-0.1;
          }, this, c));
        }
      }

      for ( var i = 0 ; i < 201 ; i++ ) {
        var b = this.PhysicalCircle.create({
          radius: 4,
          x: this.width * Math.random(),
          y: this.height + this.height * Math.random(),
          arcWidth: 0,
          border: null,
          color: '#88c',
          gravity: -0.2,
          friction: 0.96,
          mass: 0.3
        });
        this.engine.add(b);
        this.add(b);

        this.timer.i$.sub(foam.Function.bind(function bubbleWrap(b) {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }, this, b));
      }

      this.timer.i$.sub(this.invalidated.pub)
    }
  ]
});
