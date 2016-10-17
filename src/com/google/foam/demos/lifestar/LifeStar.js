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
  package: 'com.google.foam.demos.lifestar',
  name: 'LifeStar',
  extends: 'foam.graphics.StereoCView',

  classes: [
    {
      name: 'Point',
      extends: 'foam.graphics.Circle',
      properties: [
        'z',
        [ 'radius',   4 ],
        [ 'border',   null ],
        [ 'arcWidth', 0 ],
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function rotateY(a) {
          var x = this.x, z = this.z;
          this.z = z * Math.cos(a) - x * Math.sin(a);
          this.x = z * Math.sin(a) + x * Math.cos(a);
        },
        function rotateX(a) {
          var y = this.y, z = this.z;
          this.z = z * Math.cos(a) - y * Math.sin(a);
          this.y = z * Math.sin(a) + y * Math.cos(a);
        },
        function doTransform(x) {
          var oldX = this.x, oldY = this.y;
          var s = 1 - this.z/600;
          this.x *= s;
          this.y *= s;
          var t = this.transform;
          t.scale(s, s);
          x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
          this.x = oldX;
          this.y = oldY;
        },
        function paintSelf(x) {
          this.SUPER(x);
          if ( this.glowRadius ) {
            x.globalAlpha = 0.2;
            var oldR = this.radius;
            this.radius = this.glowRadius;
            this.SUPER(x);
            this.radius = oldR;
          }
        }
      ]
    }
  ],

  properties: [
    [ 'n',      197 ],
    [ 'x',      500 ],
    [ 'y',      350 ],
    [ 'width',  1200 ],
    [ 'height', 500 ],
    [ 'time',     0 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
      for ( var i = 0 ; i < this.n ; i++ ) this.addChildren(this.Point.create());
    },
    function paint(x) {
      this.SUPER(x);

      var time = this.time++;

      for ( var i = 0 ; i < this.n ; i++ ) {
        var p = this.children[i];
        var r = Math.sin(Math.PI * i/this.n)*200;
        var a = (i-time/20)*Math.PI*15/this.n;

        p.x = Math.sin(a) * r;
        p.y = Math.cos(a) * r;
        p.z = Math.sqrt(40000 - p.x*p.x - p.y*p.y) * (( i > this.n/2 ) ? 1 : -1);

        p.rotateY(0.008*time);
        p.rotateX(0.005*time);

        var on = Math.abs((time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ?  70 : 40;
        p.color = this.hsl(i*365/this.n, s, l);
      }

      this.invalidated.pub();
    }
  ]
});
