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

// Start of HTML View, not yet tested or added to files.js
// TODO: Should be a textarea in edit mode and validated HTML in
// display mode

foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLView',
//  extends: 'foam.u2.tag.TextArea',
  extends: 'foam.u2.HTMLElement',

  documentation: 'View for safely displaying HTML content.',

  css: '^ { padding: 6px 0; }',

  properties: [
    {
      name: 'data',
      attribute: true
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      this.add(this.data$);
    }
  ]
});
