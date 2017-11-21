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
  package: 'foam.nanos.auth',
  name: 'PhoneDetailView',
  extends: 'foam.u2.View',

  documentation: 'Phone Detail View',

  requires: [ 'foam.nanos.auth.Phone' ],

  css: `
    ^ {
      height: auto;
    }
    ^.span {
      display: inline;
      margin-top: 10px;
    }
    ^.property-number {
      display: inline;
      margin-left: 10px;
      margin-right: 10px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
            start().
              add(this.Phone.NUMBER.label).add(this.Phone.NUMBER).
              add(this.Phone.VERIFIED.label).add(this.Phone.VERIFIED).
            end()
    }
  ]
});
