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

  exports: [
    'view',
    'anchorRadius'
  ],

  classes: [
    {
      name: 'Anchor',
      extends: 'foam.graphics.Box',

      imports: [ 'anchorRadius', 'view' ],

      properties: [
        [ 'alpha', 0.3 ],
        [ 'color', 'blue' ],
        [ 'border', null ],
        'viewStart',
        'mouseStartX', 'mouseStartY',
        {
          class: 'Function',
          name: 'callback',
          value: function(view, viewStart, dx, dy) {
            console.log(viewStart, dx, dy);
          }
        }
      ],

      methods: [
        function init() {
          this.SUPER();
          this.height = this.width = this.anchorRadius*2 + 1;
        }
      ],

      listeners: [
        function onMouseDown(evt) {
          console.log('AnchorMouseDown: ', evt);
          if ( ! this.view ) return;
          this.viewStart = {
            x: this.view.x,
            y: this.view.y,
            width: this.view.width,
            height: this.view.height,
            rotation: this.view.rotation
          };
          this.mouseStartX = evt.offsetX;
          this.mouseStartY = evt.offsetY;
        },

        function onMouseMove(evt) {
          if ( ! this.view ) return;
          this.callback(
            this.view,
            this.viewStart,
            evt.offsetX - this.mouseStartX,
            evt.offsetY - this.mouseStartY,
            evt.offsetX,
            evt.offsetY,
            this.mouseStartX,
            this.mouseStartY);
        }
      ]
    }
  ],

  properties: [
    [ 'anchorRadius', 6 ],
    [ 'alpha', 0 ],
    [ 'border', null ],
    'selectedSub',
    {
      name: 'haloBorder',
      factory: function() { return this.HaloBorder.create(); }
    },
    { name: 'x1', expression: function() { return -0.5; } },
    { name: 'x2', expression: function(width) { return this.width/2-this.anchorRadius-0.5; } },
    { name: 'x3', expression: function(width) { return this.width-this.anchorRadius*2-0.5; } },
    { name: 'y1', expression: function() { return -0.5; } },
    { name: 'y2', expression: function(height) { return this.height/2-this.anchorRadius-0.5; } },
    { name: 'y3', expression: function(height) { return this.height-this.anchorRadius*2-0.5; } },
    {
      name: 'selected',
      postSet: function(_, n) {
        this.view = n && n.value;

        if ( this.selectedSub ) {
          this.selectedSub.detach();
          this.selectedSub = null;
        }

        this.parent && this.parent.remove(this);

        if (
            n && n.value &&
            // Avoid selecting non CViews
            foam.graphics.CView.isInstance(n.value) &&
            // Avoid selecting top-level 'canvas' objects
            n.value.parent &&
            // Avoid selecting zero-size objects like Cursor
           ( n.value.radius || n.value.width || n.value.height )
        ) {
          var v = n.value;
          v.add(this);

          // Make the halo be the first child so that it will
          // get mouse touch and move events. Replace with
          // z-index when supported.
          v.children.pop(); v.children.unshift(this);

          this.alpha = 1;
          this.selectedSub = v.sub('propertyChange', this.onSelectedPropertyChange);
          this.onSelectedPropertyChange();
        } else {
          this.alpha = 0;
        }
      }
    },
    // TODO: maybe FLOW should bind 'view' instead of 'selected'
    {
      name: 'view'
    },
    'startX', 'startY', 'mouseStartX', 'mouseStartY'
  ],

  methods: [
    function init() {
      this.SUPER();

      var halo = this;

      this.add(
        this.haloBorder,
        this.Anchor.create({x$: this.x2$, y: -26, callback: function(v, vs, _, __, x, y, sx, sy) {
          v.originX    = v.width/2;
          v.originY    = v.height/2;
          halo.originX = halo.width/2;
          halo.originY = halo.height/2;

          function toA(x, y) {
            var dx = x-vs.x-halo.originX
            var dy = y-v.y-halo.originY;
            return Math.atan2(dy, dx);
          }

          var startA = toA(sx, sy);
          var a = toA(x, y);

          v.rotation = vs.rotation + startA - a;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.y      = vs.y + dy;
          v.width  = vs.width  - dx;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x2$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.y      = vs.y + dy;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y1$, callback: function(v, vs, dx, dy) {
          v.y      = vs.y + dy;
          v.width  = vs.width  + dx;
          v.height = vs.height - dy;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.width  = vs.width  - dx;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y2$, callback: function(v, vs, dx, dy) {
          v.width  = vs.width + dx;
        }}),
        this.Anchor.create({x$: this.x1$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.x      = vs.x + dx;
          v.width  = vs.width  - dx;
          v.height = vs.height + dy;
        }}),
        this.Anchor.create({x$: this.x2$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.height = vs.height + dy;
        }}),
        this.Anchor.create({x$: this.x3$, y$: this.y3$, callback: function(v, vs, dx, dy) {
          v.width  = vs.width  + dx;
          v.height = vs.height + dy;
        }}));
    },

    function paintChildren(x) {
      var alpha = x.globalAlpha;
      x.globalAlpha = 1.0
      this.SUPER(x);
      x.globalAlpha = alpha;
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
      code: function() {
        var v = this.view;
        if ( ! v ) return;

        var r = this.anchorRadius;

        if ( v.radius ) {
          this.height = this.width = (v.radius + v.arcWidth + 3 + r*2) * 2;
          this.x        = - v.radius - v.arcWidth - r*2 - 3;
          this.y        = - v.radius - v.arcWidth - r*2 - 3;
          this.originX = v.x-this.x;
          this.originY = v.y-this.y;
        } else {
          this.x = this.y = -2*r-4;
          this.width    = v.scaleX * v.width  + 2 * ( r * 2 + 4 );
          this.height   = v.scaleY * v.height + 2 * ( r * 2 + 4 );
          this.originX  = v.originX+2*r+4
          this.originY  = v.originY+2*r+4;
        }

        this.haloBorder.x      = r;
        this.haloBorder.y      = r;
        this.haloBorder.width  = this.width  - 2 * r;
        this.haloBorder.height = this.height - 2 * r;

//        this.rotation = v.rotation;
      }
    },

    function onMouseDown(evt) {
      if ( ! this.view ) return;
      this.startX = this.view.x;
      this.startY = this.view.y;
      this.mouseStartX = evt.offsetX;
      this.mouseStartY = evt.offsetY;
    },

    function onMouseMove(evt) {
      if ( ! this.view ) return;
      this.view.x = this.startX + evt.offsetX - this.mouseStartX;
      this.view.y = this.startY + evt.offsetY - this.mouseStartY;
    }
  ]
});
