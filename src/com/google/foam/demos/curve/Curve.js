/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'com.google.foam.demos.curve',
  name: 'Curve',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Point'
  ],

  properties: [
    [ 'n',          10 ],
    [ 'width',      1600 ],
    [ 'height',     800 ],
    [ 'color',      'black' ],
    [ 'background', 'black' ],
    {
      name: 'points',
      factory: function() {
        var ps = [];
        for ( var i = 0 ; i < this.n ; i++ ) {
          ps[i] = this.Point.create({x: this.width/this.n * i, y: this.height /2});
          ps[i].v = 0;
        }
        return ps;
      }
    }
  ],

  methods: [
    function paintChildren(x) {
      x.strokeStyle = 'rgba(100,100,100,0.2)';
      x.globalCompositeOperation = 'lighten';
      var ps = this.points;
      for ( var i = 0 ; i < 50 ; i++ ) {
        x.moveTo(0, this.y/2);
        for ( var j = 0 ; j < this.n ; j++ ) {
          var p = ps[j];
          p.v += 10 * (Math.random() - Math.random());
          p.y += p.v;
          x.lineTo(p.x, p.y);
        }
        x.stroke();
      }
    }
  ]
});
