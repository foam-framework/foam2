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
  name: 'Tick',
  extends: 'foam.graphics.Circle',

  imports: [ 'data' ],

  properties: [
    'second',
    'ring'
  ],

  methods: [
   function initCView() {
     this.SUPER();

     var self = this;

     this.color$ = this.data.slot(function(seconds) {
       return seconds === self.second ? self.border : 'white';
     });
   }
  ]
});


foam.CLASS({
  name: 'TabataCView',
  extends: 'foam.graphics.CView',

  requires: [ 'Tick' ],

  exports: [ 'data' ],

  properties: [
    [ 'width',  500 ],
    [ 'height', 500 ],
    [ 'autoRepaint', true ],
    'data'
  ],

  methods: [
   function initCView() {
     this.SUPER();

//     var self = this;
//     this.second$.sub(function() { self.invalidated.pub(); });

     var d = this.data;
     for ( var r = 0 ; r < d.rounds ; r++ ) {
       var n = d.workTime + d.restTime;
       for ( var i = 0 ; i < n ; i++ ) {
         var c = this.Tick.create({
           arcWidth: 2,
           border: i < d.workTime ? 'green' : 'red',
           x: this.width  / 2 + (this.width/2  - (r+1) * 14) * Math.cos(i/n*Math.PI*2),
           y: this.height / 2 + (this.height/2 - (r+1) * 14) * Math.sin(i/n*Math.PI*2),
           radius: 5,
           second: d.warmupTime + r * n + i
         });
         this.addChildren(c);
       }
     }
   }
  ]
});
