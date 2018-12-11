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
  package: 'foam.u2.tag',
  name: 'Image',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'displayWidth',
      attribute: true
    },
    {
      name: 'displayHeight',
      attribute: true
    },
    ['alpha', 1.0],
    ['nodeName', 'img']
  ],

  methods: [
    function initE() {
      this.
        attrs({ src: this.data$ }).
        style({
          height:  this.displayHeight$,
          width:   this.displayWidth$,
          opacity: this.alpha$
        });
    }
  ]
});

foam.SCRIPT({
  package: 'foam.u2.tag',
  name: 'ImageScript',
  requires: [
    'foam.u2.U2ContextScript',
    'foam.u2.tag.Image',
  ],
  flags: ['web'],
  code: function() {
foam.__context__.registerElement(foam.u2.tag.Image);
  }
});
