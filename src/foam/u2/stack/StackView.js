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
    'foam.nanos.controller.Memento',
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

  css: '%CUSTOMCSS%',

  methods: [
    // TODO: Why is this init() instead of initE()? Investigate and maybe fix.
    function init() {
      this.setNodeName('div');
      this.addClass(this.myClass());
      this.addClass('foam-u2-stack-StackView');

      if ( this.showActions ) {
        this.start('actions')
          .add(this.data.cls_.getAxiomsByClass(foam.core.Action))
        .end();
      }

      this.listenStackView();
    },
    function listenStackView() {
      this.add(this.slot(s => this.renderStackView(s), this.data$.dot('top')));
    },
    function renderStackView(s) {
      if ( ! s ) return this.E('span');

      var view   = s[0];
      var parent = s[1];

      var X = this.getContextFromParent(parent);

      var v = foam.u2.ViewSpec.createView(view, null, this, X);
      if ( X.memento && v.mementoHead ) {
        var currMemento = this.data.findCurrentMemento();
        //we need to check if memento is already set
        //for example when we copy-paste url

        if ( currMemento.value == '' )
          currMemento.value = v.mementoHead;
        else {
          //X.memento.head is parent view head
          //so the v view mementoHead is X.memento.tail.head

          if ( this.shouldMementoValueBeChanged(X.ctrl.memento.value, v.mementoHead) ) {
            var m = this.Memento.create();

            m.value = v.mementoHead;
            currMemento.tail = m;
          }
        }
      }
      return v;
    },

    function getContextFromParent(parent) {
      if ( ! parent ) return this.__subSubContext__;
      if ( parent.isContext ) return parent;
      if ( parent.__subContext__ ) return parent.__subContext__;


      // Do a bit of a dance with the context, to ensure that exports from
      // "parent" are available to "view"
      // TODO: revisit KGR's comment from earlier; this may not be needed
      console.warn('parent is neither an element nor a context');
      return this.__subSubContext__.createSubContext(parent);
    },

    function shouldMementoValueBeChanged(mementoValue, mementoHead) {
      if ( ! mementoValue )
        return false;

      return ! decodeURI(mementoValue).includes(mementoHead);
    }
  ]
});
