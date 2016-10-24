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

  properties: [
    [ 'alpha', 0.5 ],
    [ 'border', 'blue' ],
//    [ 'borderWidth', 2 ],
    'selectedSub',
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
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },
    function paintSelf(x) {
      x.setLineDash([4, 4]);
      this.SUPER(x);
    }
  ],

  listeners: [
    {
      name: 'onSelectedPropertyChange',
//      isFramed: true,
      code: function() {
        var v = this.selected.value;
        if ( ! v ) return;
        if ( v.radius ) {
          this.height = this.width = (v.radius + v.arcWidth ) * 2 + 6;
          this.x        = v.x - v.radius - v.arcWidth - 3 ;
          this.y        = v.y - v.radius - v.arcWidth - 3
          this.originX = v.x-this.x;
          this.originY = v.y-this.y;
        } else {
          this.originX = 3;
          this.originY = 3;
          this.x        = v.x-3;
          this.y        = v.y-3;
          this.width    = v.width + 6;
          this.height   = v.height + 6;
        }
        this.rotation = v.rotation;
      }
    }
  ]
});
