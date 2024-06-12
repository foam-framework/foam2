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
  name: 'PyBranch',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'maxLvl' ],

  properties: [ 'lvl' ],

  methods: [
    function initE() {
      this.setNodeName('g').
        start('rect').
          attrs({width: 1, height: 1}).
          style({fill: this.fillColor(this.lvl)}).
        end();

      if ( this.lvl < this.maxLvl ) {
        this.add(this.PyBranch.create({lvl: this.lvl+1}).addClass('l'));
        this.add(this.PyBranch.create({lvl: this.lvl+1}).addClass('r'));
      }
    },
    {
      name: 'fillColor',
      code: foam.Function.memoize1(function(lvl) {
        return 'hsl(' + Math.floor(lvl/this.maxLvl*180) + ',70%,70%)';
      })
    }
  ]
});


foam.CLASS({
  name: 'PyTree',
  extends: 'foam.u2.Element',

  requires: [ 'PyBranch' ],

  imports: [ 'document', 'installCSS' ],

  exports: [ 'maxLvl' ],

  properties: [
    [ 'width',  1600 ],
    [ 'height', 800 ],
    'heightFactor',
    'lean', 'myCss',
    { name: 'maxLvl', value: 11 },
  ],

  methods: [
    function initE() {
      this.installCSS('','pytree','pytree');
      this.myCss = this.document.head.lastChild;

      this.setNodeName('svg').
        style({border: '1px solid lightgray', width: this.width, height: this.height}).
        on('mousemove', this.onMouseMove).
        add(this.PyBranch.create({lvl: 1, w: 80}).attrs({transform: 'translate(560 510) scale(80)'}));

      this.redraw();
    }
  ],

  listeners: [
    {
      name: 'redraw',
      isFramed: true,
      code: function() {
        var heightFactor = this.heightFactor, lean = this.lean;
        var a            = Math.atan2(heightFactor, .5+lean);
        var b            = Math.atan2(heightFactor, .5-lean);
        var lScale       = Math.sqrt(heightFactor**2 + (.5+lean)**2);
        var rScale       = Math.sqrt(heightFactor**2 + (.5-lean)**2);
        this.myCss.innerText =
          '.l { transform: scale(' + lScale + ') rotate(' + -a + 'rad) translate(0, -1px) }\n' +
          '.r { transform: translate(1px, 0) scale(' + rScale + ') rotate(' + b + 'rad) translate(-1px, -1px) }';
      }
    },

    function onMouseMove(e) {
      this.heightFactor = (1 - e.offsetY / this.height) * 0.8;
      this.lean         = e.offsetX / this.width - 0.5;
      this.redraw();
    }
  ]
});
