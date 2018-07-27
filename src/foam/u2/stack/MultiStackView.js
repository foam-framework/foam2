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
  package: 'foam.u2.control',
  name: 'MultiStackView',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.u2.control.Stack'
    },
    {
      class: 'Int',
      name: 'limit'
    }
  ],
  methods: [
    function initE() {
      this.setNodeName('div').
        add(this.of.BACK, this.of.FORWARD).
        add(this.wrap(this.data.slotAt(-1)), this.wrap(this.data.slotAt(-2)), this.wrap(this.data.slotAt(-3)));
    },
    function wrap(s) {
      return this.slot(function(s) {
        var view = s[0];
        var parent = s[1];

        // Do a bit of a dance with the context, to ensure that exports from "parent"
        // are available to "view"
        var X = parent ? this.__subSubContext__.createSubContext(parent) : this.__subSubContext__;
        return foam.u2.ViewSpec.createView(view, null, this, X);
      }, s);
    }
  ]
});
