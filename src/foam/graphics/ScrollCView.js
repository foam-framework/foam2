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
  package: 'foam.graphics',
  name: 'ScrollCView',
  extends: 'foam.graphics.CView',

  properties: [
    {
      class: 'Float',
      name: 'width',
      value: 20
    },
    {
      class: 'Float',
      name: 'height',
      value: 100
    },
    {
      class: 'Boolean',
      name: 'vertical',
      value: true
    },
    {
      class: 'Int',
      name: 'value',
//      help: 'The first element being shown, starting at zero.',
      preSet: function(_, value) {
        return Math.max(0, Math.min(this.size-this.extent, value));
      },
      postSet: function(old, nu) {
        if ( old !== nu ) this.invalidated.pub();
      }
    },
    {
      class: 'Int',
      name: 'extent',
//      help: 'Number of elements shown.',
//      minValue: 1, // TODO: add back when minValue supported
      value: 10,
      postSet: function(old, nu) {
        if ( old !== nu ) this.invalidated.pub();
      }
    },
    {
      class: 'Int',
      name: 'size',
//      help: 'Total number of elements being scrolled through.',
      value: 0,
      postSet: function(old, size) {
        if ( old !== size ) this.invalidated.pub();
        // Trigger the preSet for value, so it stays within range.
        this.value = this.value;
      }
    },
    {
      class: 'Int',
      name: 'minHandleSize',
//      help: 'Minimum size to make the drag handle.'
      value: 10
    },
    {
      class: 'Float',
      name: 'handleSize',
      expression: function(minHandleSize, size, extent, height, innerBorder) {
        var h  = height - 2 * innerBorder;
        var hs = size > 0 ? extent * h / size : 0;

        return hs < minHandleSize ? minHandleSize : hs;
      }
    },
    {
      class: 'Int',
      name: 'innerBorder',
      value: 2
    },
    {
      class: 'String',
      name: 'handleColor',
      value: 'rgb(107,136,173)'
    },
    {
      class: 'String',
      name: 'borderColor',
      value: '#999'
    },
    {
      name: 'yMax',
      expression: function(height, innerBorder, handleSize)  {
        return height - innerBorder - handleSize;
      }
    },
    {
      name: 'rate',
      expression: function(size, extent, yMax, innerBorder) {
        return size ? ( yMax - innerBorder ) / (size - extent) : 0;
      }
    },
  ],

  methods: [
    function initCView() {
      this.onDetach(this.canvas.pointer.touch.sub(this.onTouch));

      var self = this;
      var mouseInput = this.canvas.pointer.mouseInput;
      this.onDetach(mouseInput.down.sub(function() {
        var moveSub = mouseInput.move.sub(function() {
          self.value = self.yToValue(mouseInput.y);
        });
        mouseInput.up.sub(function(s) {
          moveSub.detach();
          s.detach();
        });
      }));
    },

    function yToValue(y) {
      return ( y - this.innerBorder ) / this.rate;
    },

    function valueToY(value) {
      return value * this.rate + this.innerBorder;
    },

    function paintSelf(c) {
      if ( ! this.size ) return;

      if ( ! c ) return;

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.lineWidth = 0.4;
      c.strokeRect(0, 0, this.width, this.height);

      c.fillStyle = this.handleColor;

      c.fillRect(
        2,
        this.valueToY(this.value),
        this.width - 4,
        this.handleSize);
    }
  ],

  listeners: [
    {
      name: 'onTouch',
      code: function(_, __, touch) {
        this.value = this.yToValue(touch.y);

        // prevents highlighting of other elements while scrolling
        touch.claimed = true;
      }
    },
  ]
});
