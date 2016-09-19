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
  package: 'foam.u2.md.tag',
  name: 'PaperInput',
  extends: 'foam.u2.tag.Input',

  properties: [
    [ 'nodeName', 'paper-input' ],
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'Boolean',
      name: 'alwaysFloatLabel'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.attrs({
        label: this.label$,
        'always-float-label': this.alwaysFloatLabel,
        'no-label-float': this.slot(function(label) { return ! label; },
            this.label$)
      });
    },

    function link() {
      this.attrSlot(null, this.onKey ? 'input' : 'change').linkFrom(this.data$);
    }
  ]
});
