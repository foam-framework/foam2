/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.pm',
   name: 'TemperatureCView',
   extends: 'foam.graphics.CView',

   documentation: 'Display PM totalTime as a simple colour bar.',

   imports: [ 'maxTotalTime' ],

   properties: [
     [ 'totalTime', 100 ],
     [ 'width', 120 ],
     [ 'height', 18 ],
     [ 'autoRepaint', true ],
     {
       name: 'temperature',
       expression: function(totalTime, maxTotalTime) {
         return totalTime >= maxTotalTime ? 1 : totalTime/maxTotalTime;
       }
     }
   ],

   methods: [
     function paintSelf(x) {
       var g = x.fillStyle = x.createLinearGradient(0, 0, this.width, this.height);
       g.addColorStop(0, 'hsl(64, 100%, 50%)');
       g.addColorStop(1, 'hsl(0, 100%, 50%)');
       x.fillRect(0, 0, this.width*this.temperature, this.height);
     }
   ]
 });
