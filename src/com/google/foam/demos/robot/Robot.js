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
  package: 'com.google.foam.demos.robot',
  name: 'Robot',
  extends: 'foam.graphics.CView',

  implements: [ 'foam.physics.Physical' ],

  // author: Sebastian Greer (age 11)

  requires: [
    'foam.graphics.Arc',
    'foam.graphics.Box as Rectangle',
    'foam.graphics.Circle',
    'foam.graphics.CView',
    'foam.graphics.ImageCView',
    'foam.util.Timer'
  ],

  properties: [
    [ 'width',  25 ],
    [ 'height', 45 ],
    {
      name: 'timer',
      hidden: true,
      factory: function() {
        return this.__context__.timer || this.Timer.create();
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var body = this.Rectangle.create({
        width:  20,
        height: 30,
        color:  '#ccc'
      });
      this.add(body);

//      var logo = this.ImageCView.create({src:'./js/com/google/watlobby/img/foam_red.png', x:17, y:3, width: 30, height: 5, a: Math.PI/2});
//      body.add(logo);

      var neck = this.Rectangle.create({
        color:  'black',
        width:  2,
        y:     -13,
        x:      9,
        height: 15
      });
      body.add(neck);

      var head = this.Circle.create({
        radius: 8,
        color:  'purple',
        x:      0,
        y:      -5
      });
      neck.add(head);

      var engine = this.Circle.create({
        radius: 8,
        color:  'red',
        border: null,
        x:      10,
        y:      30.5,
        start:  0,
        end:    Math.PI
      });
      body.add(engine);

      var eye = this.Circle.create({
        radius: 5,
        color:  'white'
      });
      head.add(eye);

      var pupil = this.Circle.create({
        radius: 2,
        color:  'lightblue'
      });
      eye.add(pupil);

      // animate
      var timer = this.timer;
      timer.time$.sub(function() {
        var t = timer.time/16;
        body.y        = 10 * Math.cos(t/9);
        body.rotation = Math.PI / 8 * Math.cos(t/30);
        pupil.x       = 4* Math.cos(t/15);
        neck.height   = 15 + 10 * Math.cos(t/15);
        neck.y        = -13 - 10* Math.cos(t/15);
      });
      timer.start();
    }
  ]
});
