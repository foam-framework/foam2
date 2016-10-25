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
  package: 'com.google.flow',
  name: 'HaloBorder',
  extends: 'foam.graphics.Box',

  properties: [
    [ 'border', 'blue' ] 
  ],

  methods: [
    function hitTest(p) { return false; },

    function paintSelf(x) {
      x.setLineDash([4, 4]);
      this.SUPER(x);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Halo',
  extends: 'foam.graphics.Box',

  requires: [ 'com.google.flow.HaloBorder' ],

  exports: [ 'anchorRadius' ],

  classes: [
    {
      name: 'Anchor',
      extends: 'foam.graphics.Box',

      imports: [ 'anchorRadius' ],

      properties: [
        [ 'alpha', 0.3 ],
        [ 'color', 'blue' ],
        [ 'border', null ]
      ],

      methods: [
        function init() {
          this.SUPER();
          this.height = this.width = this.anchorRadius*2 + 1;
        }
      ]
    }
  ],

  properties: [
    [ 'anchorRadius', 6 ],
    [ 'alpha', 0 ],
    [ 'border', null ],
    'selectedSub',
    { name: 'x1', expression: function() { return 0; } },
    { name: 'x2', expression: function(width) { return this.width/2-this.anchorRadius; } },
    { name: 'x3', expression: function(width) { return this.width-this.anchorRadius*2-1; } },
    { name: 'y1', expression: function() { return 0; } },
    { name: 'y2', expression: function(height) { return this.height/2-this.anchorRadius; } },
    { name: 'y3', expression: function(height) { return this.height-this.anchorRadius*2-1; } },
    {
      name: 'selected',
      postSet: function(_, n) {
        if ( this.selectedSub ) {
          this.selectedSub.destroy();
          this.selectedSub = null;
        }

        if ( n && n.value && foam.graphics.CView.isInstance(n.value) ) {
          var v = n.value;
          this.alpha = 1;
          this.selectedSub = v.sub('propertyChange', this.onSelectedPropertyChange);
          this.onSelectedPropertyChange();
        } else {
          this.alpha = 0;
        }
      }
    },
    'startX', 'startY', 'mouseStartX', 'mouseStartY'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.add(
        this.HaloBorder.create({x$: this.x1$, y$: this.y1$, width$: this.width$, height$: this.height$}),
        this.Anchor.create({x$: this.x2$, y: -26}),
        this.Anchor.create({x$: this.x1$, y$: this.y1$}),
        this.Anchor.create({x$: this.x2$, y$: this.y1$}),
        this.Anchor.create({x$: this.x3$, y$: this.y1$}),
        this.Anchor.create({x$: this.x1$, y$: this.y2$}),
        this.Anchor.create({x$: this.x3$, y$: this.y2$}),
        this.Anchor.create({x$: this.x1$, y$: this.y3$}),
        this.Anchor.create({x$: this.x2$, y$: this.y3$}),
        this.Anchor.create({x$: this.x3$, y$: this.y3$}));
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
      code: function() {
        var v = this.selected.value;
        var r = this.anchorRadius;
        if ( ! v ) return;
        if ( v.radius ) {
          this.height = this.width = (v.radius + v.arcWidth + 3 + r*2) * 2;
          this.x        = v.x - v.radius - v.arcWidth - r*2 - 3;
          this.y        = v.y - v.radius - v.arcWidth - r*2 - 3;
          this.originX = v.x-this.x;
          this.originY = v.y-this.y;
        } else {
          this.originX = this.originY = r + 3;
          this.x        = v.x-2*r-4;
          this.y        = v.y-2*r-4;
          this.width    = v.width + 2 * ( r * 2 + 4 );
          this.height   = v.height + 2 * ( r * 2 + 4 );
        }
        this.rotation = v.rotation;
      }
    },

    function onMouseDown(evt) {
      if ( ! this.selected || ! this.selected.value ) return;
      this.startX = this.selected.value.x;
      this.startY = this.selected.value.y;
      this.mouseStartX = evt.offsetX;
      this.mouseStartY = evt.offsetY;
    },

    function onMouseMove(evt) {
      if ( ! this.selected || ! this.selected.value ) return;
      this.selected.value.x = this.startX + evt.offsetX - this.mouseStartX;
      this.selected.value.y = this.startY + evt.offsetY - this.mouseStartY;
    }
  ]
});
