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
  extends: 'foam.graphics.Arc',

  imports: [ 'data' ],

  properties: [
    'maxRadius',
    'position',
    'round',
    'second',
    [ 'radius', 10 ]
  ],

  methods: [
   function init() {
     this.SUPER();

     var self = this;
     var d = this.data;
     var i = this.position;
     var r = this.round;
     var n = d.workTime + d.restTime;
     var a = -Math.PI/2 + (i-d.restTime-1)/n*Math.PI*2;

     this.border      = i > d.restTime ? '#0e0' : r>1 ? 'red' : 'gray';
     this.arcWidth    = this.maxRadius / 2 / d.rounds - 4;
     this.radius      = this.maxRadius - (r+1) * 16;
     this.start       = a+0.01;
     this.end         = a + Math.PI*2/n-0.01;
     this.shadowColor = this.border;

     this.data.seconds$.sub(function() {
       self.alpha      = 0.6;
       self.shadowBlur = 0;

       if ( d.currentRound === self.round ) {
         self.alpha = 0.75;
         self.shadowBlur = 15;
       }

       if ( d.seconds === self.second ) {
         self.alpha = 1;
         self.shadowBlur = 25;
       }

       if ( d.seconds > self.second ) {
         self.alpha = 0.2;
       }
     });
   }
  ]
});


foam.CLASS({
  name: 'TabataCView',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Circle',
    'Tick'
  ],

  exports: [ 'data' ],

  properties: [
    [ 'color', 'black' ],
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

     var d      = this.data;
     var second = 0;
     var R      = Math.min(this.width, this.height)/2;

     for ( var r = 0 ; r < d.rounds ; r++ ) {
       var n = d.workTime + d.restTime;
       for ( var i = r ? 0 : d.restTime - d.setupTime ; i < n ; i++ ) {
         this.addChildren(this.Tick.create({
           x: this.width/2,
           y: this.height/2,
           maxRadius: R,
           position: i,
           round: r+1,
           second: second++
         }));
       }
     }

     var colors = {
       Rest: 'red',
       Finished: 'white',
       "WORK!": 'green',
       Warmup: 'white'
     };

     var color$ = d.action$.map(function(s) { return colors[s]; });

     this.addChildren(
       /*
       this.Circle.create({
         border$: d.action$.map(function(s) { return colors[s]; }),
         radius$: d.currentRound$.map(function(round) { return R - round * 16; }),
         arcWidth: 20,
         color: null,
         alpha: 0.1,
         x: this.width  / 2,
         y: this.height / 2
       }),
       */
       this.Label.create({
         font: '50px Arial',
         width: 60,
         height: 60,
         x: this.width  / 2 - 30,
         y: this.height / 2 - 20,
         align: 'center',
         shadowBlur: 10,
         color$: color$,
         shadowColor$: color$,
         text$: d.action$
       }),
       this.Label.create({
         font: '30px Arial',
         width: 60,
         height: 60,
         x: this.width  / 2 - 30,
         y: this.height / 2 - 85,
         align: 'center',
         shadowBlur: 10,
         shadowColor: 'white',
         color: 'white',
         text$: d.slot(function(currentRound, rounds) { return currentRound + ' / ' + rounds; })
       }),
       this.Label.create({
         font: '40px Arial',
         width: 60,
         height: 60,
         x: this.width  / 2 - 30,
         y: this.height / 2 + 35,
         align: 'center',
         shadowBlur: 10,
         color$: color$,
         shadowColor$: color$,
         text$: d.remaining$.map(function(s) { return s; })
       })
     );
   }
  ]
});
