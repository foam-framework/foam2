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
  name: 'Halo',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'Anchor',
      extends: 'foam.graphics.Box',
      
      properties: [
        [ 'width', 11 ],
        [ 'height', 11 ],
        [ 'alpha', 0.3 ],
        [ 'color', 'blue' ],
        [ 'border', null ]
      ]
    }
  ],

  properties: [
    [ 'alpha', 0.5 ],
    [ 'border', 'blue' ],
    'selectedSub',
    { name: 'x1', expression: function() { return -6; } },
    { name: 'x2', expression: function(width) { return this.width/2 - 5; } },
    { name: 'x3', expression: function(width) { return this.width - 5; } },
    { name: 'y1', expression: function() { return -6; } },
    { name: 'y2', expression: function(height) { return this.height/2 - 5; } },
    { name: 'y3', expression: function(height) { return this.height - 5; } },
    {
      name: 'selected',
      postSet: function(_, n) {
        if ( this.selectedSub ) {
          this.selectedSub.destroy();
          this.selectedSub = null;
        }

        if ( n && n.value ) {
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
        this.Anchor.create({x$: this.x2$, y: -26}),
        this.Anchor.create({x$: this.x1$, y$: this.y1$}),
        this.Anchor.create({x$: this.x2$, y$: this.y1$}),
        this.Anchor.create({x$: this.x3$, y$: this.y1$}),
        this.Anchor.create({x$: this.x1$, y$: this.y2$}),
        this.Anchor.create({x$: this.x3$, y$: this.y2$}),
        this.Anchor.create({x$: this.x1$, y$: this.y3$}),
        this.Anchor.create({x$: this.x2$, y$: this.y3$}),
        this.Anchor.create({x$: this.x3$, y$: this.y3$}));
    },
    function paintSelf(x) {
      x.setLineDash([4, 4]);
      this.SUPER(x);
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
      code: function() {
        var v = this.selected.value;
        if ( ! v ) return;
        if ( v.radius ) {
          this.height = this.width = (v.radius + v.arcWidth ) * 2 + 14;
          this.x        = v.x - v.radius - v.arcWidth - 7 ;
          this.y        = v.y - v.radius - v.arcWidth - 7
          this.originX = v.x-this.x;
          this.originY = v.y-this.y;
        } else {
          this.originX = 7;
          this.originY = 7;
          this.x        = v.x-7;
          this.y        = v.y-7;
          this.width    = v.width + 14;
          this.height   = v.height + 14;
        }
        this.rotation = v.rotation;
      }
    },

    function onMouseDown(evt) {
      this.startX = this.selected.value.x;
      this.startY = this.selected.value.y;
      this.mouseStartX = evt.offsetX;
      this.mouseStartY = evt.offsetY;
    },

    function onMouseMove(evt) {
      this.selected.value.x = this.startX + evt.offsetX - this.mouseStartX;
      this.selected.value.y = this.startY + evt.offsetY - this.mouseStartY;
    }
  ]
});
