/**
 * @license
 * Copyright 2021 Google Inc. All Rights Reserved.
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
  name: 'IFrameHTMLView',
  extends: 'foam.u2.HTMLElement',

  css: `
    iframe {
      border: 1px solid /*%GREY4%*/;
      padding: 8px;
    }
  `,

  properties: [
    'data'
  ],

  methods: [    
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      var self = this;

      this.start('iframe')
        .attrs({ srcdoc: this.data })
        .on('load', function() { self.resizeIFrame(this) }
      ).end();
    },

    function resizeIFrame(el) {
      // reset padding and margins of iframe document body
      el.contentDocument.body.style.padding = 0;
      el.contentDocument.body.style.margin = 0;

      // set iframe dimensions according to the document / its content
      el.style.height = Math.max(
        el.contentDocument.documentElement.offsetHeight,
        el.contentDocument.body.firstElementChild.offsetHeight
      );
      el.style.width = Math.max(
        el.contentDocument.documentElement.offsetWidth,
        el.contentDocument.body.firstElementChild.offsetWidth
      );
    }
  ]
});
