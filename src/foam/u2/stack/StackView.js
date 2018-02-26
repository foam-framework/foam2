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

  exports: [ 'data as stack' ],

  properties: [
    {
      name: 'data',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    }
  ],

  methods: [
    // TODO: Why is this init() instead of initE()? Investigate and maybe fix.
    function init() {
      this.setNodeName('div');
      this.addClass(this.myClass());

      if ( this.showActions ) {
        this.start('actions')
            .add(this.data.cls_.getAxiomsByClass(foam.core.Action))
            .end();
      }

      this.add(this.slot(function(s) {
        if ( ! s ) return this.E('span');

        var view = s[0];
        var parent = s[1];


        // Do a bit of a dance with the context, to ensure that exports from "parent"
        // are available to "view"
        var X = parent ? this.__subSubContext__.createSubContext(parent) : this.__subSubContext__;

        return foam.u2.ViewSpec.createView(view, null, this, X);

      }, this.data$.dot('top')));
    }
  ]
});
