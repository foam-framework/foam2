/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'PopupView',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      position: absolute;
      box-sizing: border-box;
      box-shadow: 0px 0px 100px rgba(0,0,0,.1);
      text-align: center;
      z-index: 999;
    }

    ^:before, ^:after {
      content: ' ';
      height: 0;
      position: absolute;
      width: 0;
      border: 10px solid transparent;
    }

    ^:before {
      border-bottom-color: #fff;
      position: absolute;
      top: -20px;
      left: calc(50% - 10px);
      z-index: 2;
    }

    ^:after {
      border-bottom-color: #ddd;
      position: absolute;
      top: -21px;
      left: calc(50% - 10px);
      z-index: 1;
    }
  `,

  properties: [
    'x',
    'y',
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'padding'
  ],

  methods: [
    function initE() {
      var self     = this;
      var parent   = this.parentNode;
      var close    = function() {
        self.remove();
        bg.remove();
      };

      if ( this.padding == null   ) this.padding = 20;
      if ( this.y == null         ) this.y = (parent.el().clientHeight - this.height)/2;
      if ( this.x == null         ) this.x = (parent.el().clientWidth  - this.width )/2;
      if ( this.width != null     ) this.style({ width     : this.width     + 'px' });
      if ( this.height != null    ) this.style({ height    : this.height    + 'px' });
      if ( this.maxWidth != null  ) this.style({ maxWidth  : this.maxWidth  + 'px' });
      if ( this.maxHeight != null ) this.style({ maxHeight : this.maxHeight + 'px' });

      // Make a full-screen transparent background, which when clicked,
      // closes this Popup
      var bg = this.E('div').
        style({
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0,
          top: 0,
          zIndex: 998
        }).
        on('click', close).
        write();

      this.
        addClass(this.myClass()).
        style({
          padding: this.padding + 'px',
          left:    this.x + 'px',
          top:     this.y + 'px'
        }).
        onunload.sub(close);

      parent.style({position: 'relative'});
    }
  ]
});
