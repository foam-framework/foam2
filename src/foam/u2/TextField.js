/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'TextField',
  extends: 'foam.u2.tag.Input',

  css: `
    input[type="search"] { -webkit-appearance: textfield !important; }
    ^:read-only { border: none; background: rgba(0,0,0,0); }
  `,

  properties: [
    {
      class: 'Int',
      name: 'displayWidth'
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);

      if ( ! this.displayWidth ) {
        this.displayWidth = prop.displayWidth;
      }

      if ( ! this.size ) {
        this.size = this.displayWidth;
      }

      if ( prop.visibility ) {
        this.visibility = prop.visibility;
      }
    }
  ]
});
