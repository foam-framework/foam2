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
  name: 'Stack',

  properties: [
    {
      name: 'stack_',
      hidden: true,
      factory: function() { return []; }
    },
    {
      class: 'Int',
      name: 'depth',
      value: 0
    },
    {
      class: 'Int',
      name: 'pos',
      value: -1,
      preSet: function(_, p) {
        if ( isNaN(p) || p > this.depth ) return this.depth - 1;
        if ( p < 0 ) return 0;
        return p;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'top',
      hidden: true,
      expression: function(pos) {
        return this.stack_[pos] || null;
      }
    }
  ],

  methods: [
    function slotAt(i) {
      return this.StackSlot.create({
        pos: i,
        stack: this
      });
    },

    function at(i) {
      return i < 0 ? this.stack_[this.pos + i + 1] : this.stack_[i];
    },

    function push(v, parent) {
      if ( foam.u2.Element.isInstance(v) ) {
        console.warn("Views are not recommended to be pushed to a stack. Please use a viewSpec.");
      }
      // "parent" is the parent object for this view spec.  A view of this stack
      // should ensure that the context that "v" is rendered in extends from
      // both the u2.Element is it being rendered under, and from the "parent"
      // parameter.  This way views on the stack can export values to views
      // that get rendered after them.
      var pos = this.pos + 1;

      this.depth = pos + 1;
      this.stack_.length = this.depth;
      this.stack_[pos] = [v, parent];
      this.pos = pos;
    }
  ],

  actions: [
    {
      name: 'back',
      icon: 'arrow_back',
      isEnabled: function(pos) { return pos > 0; },
      code: function() { this.pos--; }
    },
    {
      name: 'forward',
      icon: 'arrow_forward',
      isEnabled: function(pos, depth) { return pos < depth - 1; },
      code: function() { this.pos++; }
    }
  ],

  classes: [
    {
      name: 'StackSlot',

      implements: [ 'foam.core.Slot' ],

      properties: [
        {
          name: 'stack'
        },
        {
          class: 'Int',
          name: 'pos'
        }
      ],

      methods: [
        function init() {
          this.onDetach(this.stack.pos$.sub(this.onStackChange));
        },

        function get() {
          return this.stack.at(this.pos);
        },

        function set() {
          // unimplemnted.
        },

        function sub(l) {
          return this.SUPER('update', l);
        },

        function toString() {
          return 'StackSlot(' + this.pos + ')';
        }
      ],

      listeners: [
        function onStackChange(s) {
          if ( this.pos < 0 || this.pos === this.stack.pos ) {
            this.pub('update');
          }
        }
      ]
    }
  ]
});
