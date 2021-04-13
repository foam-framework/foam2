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
  name: 'PyTree',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'Float', name: 'w', value: 80 },
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { class: 'String', name: 'rotate' },
    { name: 'heightFactor', value: 0.55 },
    { name: 'lean', value: 0 },
    { name: 'lvl', value: 1 },
    { name: 'maxlvl', value: 11 }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('g').
          attrs({transform: 'translate(' + this.x + ' ' + this.y + ') ' + this.rotate}).
          start('rect').
            attrs({width: this.w, height: this.w, x: 0, y: 0}).
            style({fill: 'hsl(' + this.lvl/this.maxlvl*180 + ',70%,70%)'}).
          end();

      if ( this.lvl < this.maxlvl ) {
        var lean      = this.lean, w = this.w;
        var trigH     = this.heightFactor * w;
        var nextRight = Math.sqrt(trigH**2 + (w * (.5+lean))**2);
        var nextLeft  = Math.sqrt(trigH**2 + (w * (.5-lean))**2);
        var A         = Math.atan(trigH / ((.5-lean) * w));
        var B         = Math.atan(trigH / ((.5+lean) * w));

        this.add(
          nextLeft > 1 && this.cls_.create({
            x: 0,
            y: -nextLeft,
            w: nextLeft,
            rotate: 'rotate(' + this.radToDeg(-A) + ' 0 ' + nextLeft + ')',
            lvl: this.lvl+1,
            maxlvl: this.maxlvl,
            heightFactor: this.heightFactor,
            lean: this.lean
          }),
          nextRight > 1 && this.cls_.create({
            x: Math.cos(A)*nextLeft,
            y: -nextRight - Math.sin(A)*nextLeft,
            w: nextRight,
            rotate: 'rotate(' + this.radToDeg(B) + ' 0 ' + nextRight + ')',
            lvl: this.lvl+1,
            maxlvl: this.maxlvl,
            heightFactor: this.heightFactor,
            lean: this.lean
          }));
      }
    },

    function radToDeg(r) { return 180*r/Math.PI; }
  ]
});


foam.CLASS({
  name: 'PyTreeController',
  extends: 'foam.u2.Element',

  requires: [ 'PyTree' ],

  properties: [
    { name: 'heightFactor', value: 0.55 },
    { name: 'lean',         value: 0 }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('svg').
        attrs({width: 1600, height: 800}).
        on('mousemove', this.onMouseMove).
        add(this.slot(function(heightFactor, lean) {
          return this.PyTree.create({x: 800, y: 500, heightFactor: heightFactor, lean: lean});
        }));
    }
  ],

  listeners: [
    {
      name: 'onMouseMove',
//      isFramed: true,
      code: function(e) {
        var x = e.clientX, y = e.clientY;
        this.heightFactor = y / this.getAttribute('height') * 0.8;
        this.lean         = x / this.getAttribute('width') - 0.5;
      }
    }
  ]
});


//var tree = PyTree.create();
//foam.__context__.E('svg').style({padding: 500}).add(tree).write();

var treeCtrl = PyTreeController.create();
treeCtrl.write();
