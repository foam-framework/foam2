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
  package: 'foam.u2.tag',
  name: 'TextArea',
  extends: 'foam.u2.View',

  properties: [
    [ 'nodeName', 'textarea' ],
    {
      name: 'data',
    },
    {
      class: 'Int',
      name: 'rows',
      attribute: true,
      value: 4
    },
    {
      class: 'Int',
      name: 'cols',
      attribute: true,
      value: 60
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true,
      documentation: 'When true, $$DOC{ref:".data"} is updated on every ' +
          'keystroke, rather than on blur.',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.cssClass(this.myCls());
      this.attrSlot(
        'value',
        this.onKey ? 'input' : 'change').linkFrom(this.data$);
    }
  ]
});
