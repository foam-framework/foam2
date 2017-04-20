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
  package: 'foam.u2.stack',
  name: 'StackView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.stack.Stack'
  ],

  methods: [
    function initE() {
      this.setNodeName('div').
        add(this.Stack.BACK, this.Stack.FORWARD).
        add(this.slot(function(s) {
          return foam.u2.ViewSpec.createView(s, null, this, this.__subSubContext__);
        }, this.data$.dot('top')));
    }
  ]
});
