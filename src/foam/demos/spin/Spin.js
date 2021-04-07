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
  package: 'foam.demos.spin',
  name: 'Spin',
  extends: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Arc' ],

  properties: [
    [ 'width',  500 ],
    [ 'height', 500 ],
    [ 'time',   0 ]
  ],

  methods: [
    function addArc(a, arc) {
      this.time$.sub(function(_, __, ___, time$) {
        arc.start += Math.cos(time$.get() / 4000) * (a+1)/100;
        arc.end    = arc.start + Math.PI;
      });
      this.add(arc);
    },

    function initCView() {
      this.SUPER();
      for ( var a = 0 ; a < 20 ; a++ ) this.addArc(a, this.Arc.create({
        x: this.width / 2,
        y: this.height / 2,
        radius: 5+a * 12 * this.width / 500,
        arcWidth: 10 * this.width / 500,
        border: this.hsl(18*a, 90, 60)
      }));
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() { this.time++; this.tick(); this.invalidated.pub(); }
    }
  ]
});
