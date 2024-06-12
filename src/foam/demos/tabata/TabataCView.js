/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
     var d    = this.data;
     var i    = this.position;
     var r    = this.round;
     var n    = d.workTime + d.restTime;
     var a    = -Math.PI/2 + (i-d.restTime-1)/n*Math.PI*2;

     this.border      = i >= d.restTime ? '#0f0' : r > 1 ? '#f00' : 'yellow';
     this.arcWidth    = this.maxRadius / 2 / d.rounds - 4;
     this.radius      = this.maxRadius - r * this.maxRadius / 2 / d.rounds;
     this.start       = a+0.01;
     this.end         = a + Math.PI*2/n-0.01;
     this.shadowColor = this.border;

     this.data.seconds$.sub(function() {
       self.alpha      = 0.6;
       self.shadowBlur = 0;

       if ( d.currentRound === self.round ) {
         self.alpha      = 0.75;
         self.shadowBlur = 15;
       }

       if ( d.seconds === self.second ) {
         self.alpha      = 1;
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
    'foam.graphics.Circle',
    'foam.graphics.Label',
    'Tick'
  ],

  exports: [ 'data' ],

  properties: [
    [ 'color',       'black' ],
    [ 'width',       500 ],
    [ 'height',      500 ],
    [ 'autoRepaint', true ],
    'data'
  ],

  methods: [
   function initCView() {
     this.SUPER();

     this.data.rounds$.sub(this.redraw2);
     this.data.workTime$.sub(this.redraw2);
     this.data.restTime$.sub(this.redraw2);
     this.data.setupTime$.sub(this.redraw2);

     var d      = this.data;
     var second = 0;
     var R      = Math.min(this.width, this.height)/2;

     for ( var r = 0 ; r < d.rounds ; r++ ) {
       var n = d.workTime + d.restTime;
       for ( var i = r ? 0 : d.restTime - d.setupTime ; i < n ; i++ ) {
         this.add(this.Tick.create({
           x:         this.width/2,
           y:         this.height/2,
           maxRadius: R,
           position:  i,
           round:     r+1,
           second:    second++
         }));
       }
     }

     var colors = {
       Rest:     '#f00',
       Finished: 'white',
       "WORK!":  '#0f0',
       Warmup:   'yellow'
     };

     var color$ = d.action$.map(function(s) { return colors[s]; });

     this.add(
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
         font:         '50px Arial',
         width:        60,
         height:       60,
         x:            this.width  / 2 - 30,
         y:            this.height / 2 - 20,
         align:        'center',
         shadowBlur:   20,
         color$:       color$,
         shadowColor$: color$,
         text$:        d.action$
       }),
       this.Label.create({
         font:        '30px Arial',
         width:       60,
         height:      60,
         x:           this.width  / 2 - 30,
         y:           this.height / 2 - 85,
         align:       'center',
         shadowBlur:  10,
         shadowColor: 'white',
         color:       'white',
         text$:       d.slot(function(currentRound, rounds) { return currentRound + ' / ' + rounds; })
       }),
       this.Label.create({
         font:         '40px Arial',
         width:        60,
         height:       60,
         x:            this.width  / 2 - 30,
         y:            this.height / 2 + 35,
         align:        'center',
         shadowBlur:   10,
         color$:       color$,
         shadowColor$: color$,
         // TODO: why is this necessary?
         text$:        d.remaining$
       })
     );
   }
 ],

 listeners: [
   function redraw2() {
     this.removeAllChildren();
     this.initCView();
   }
 ]
});


foam.CLASS({
  name: 'TabataBarCView',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.graphics.Box',
    'foam.graphics.Label'
  ],

  exports: [ 'data' ],

  properties: [
    [ 'color',       'black' ],
    [ 'width',       100 ],
    [ 'height',      500 ],
    [ 'autoRepaint', true ],
    'data'
  ],

  methods: [
   function initCView() {
     this.SUPER();

     var d       = this.data;
     var second  = 0;
     var seconds = d.rounds * ( d.workTime + d.restTime ) - d.restTime + d.setupTime;

     for ( var r = 0 ; r < d.rounds ; r++ ) {
       var restTime = r ? d.restTime : d.setupTime;

       this.add(
         this.Box.create({
           color:  r ? '#f00' : 'yellow',
           x:      30,
           y:      second / seconds * this.height,
           width :  this.width - 20,
           height: restTime / seconds * this.height
         }),
         this.Box.create({
           color:  '#0f0',
           x:      30,
           y:      (second+restTime) / seconds * this.height,
           width : this.width - 20,
           height: d.workTime / seconds * this.height
         })
       );
       second += d.workTime;
       second += restTime;
     }
   }
  ]
});
