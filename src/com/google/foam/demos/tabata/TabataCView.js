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

     this.shadowColor = this.border;

     this.data.seconds$.sub(function() {
       var seconds = self.data.seconds;
       if ( seconds === self.second ) {
         self.alpha = 1;
         self.color = self.border;
         self.radius = 7;
         self.shadowBlur = 15;
       } else if ( seconds > self.second ) {
         self.alpha = 0.3;
         self.color = 'white';
         self.radius = 3;
         self.shadowBlur = 0;
       } else {
         self.alpha = 1;
         self.color = 'white';
         self.radius = 4;
         self.shadowBlur = 0;
       }
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
     var second = 0;

     for ( var r = 0 ; r < d.rounds ; r++ ) {
       var n = d.workTime + d.restTime;
       for ( var i = r ? 0 : d.restTime - d.warmupTime ; i < n ; i++ ) {
         var a = -Math.PI/2 + (i-d.restTime-1)/n*Math.PI*2;
         var c = this.Tick.create({
           arcWidth: 2,
           border: i > d.restTime ? 'green' : r ? 'red' : 'gray',
           x: this.width  / 2 + (this.width/2  - (r+1) * 16) * Math.cos(a),
           y: this.height / 2 + (this.height/2 - (r+1) * 16) * Math.sin(a),
           radius: 5,
           second: second++
         });
         this.addChildren(c);
       }
     }
   }
  ]
});
