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

  imports: [
    'memento'
  ],

  requires: [
    'foam.nanos.controller.Memento'
  ],

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

    function push(v, parent, opt_id) {
      /** opt_id - used to give some unique id to the view being pushed. If it matches the current view then push() ignored. **/

      // Avoid feedback of views updating mementos causing themselves to be re-inserted
      if ( this.top && opt_id && this.top[2] === opt_id ) return;

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
      this.stack_[pos] = [v, parent, opt_id];
      this.pos = pos;
    },
    function deleteMemento(mementoToDelete) {
      /** setting the last not null memento in memento chain to null to update application controller memento value on stack.back **/
      var m = this.memento;
      if ( ! m )
        return;
      var tail = this.memento.tail;
      
      if ( tail == null ) {
        this.memento.value$.set('');
        return;
      }

      while ( m != null && m.tail != null && m.tail.value.indexOf(mementoToDelete) != 0 ) {
        m = m.tail;
      }

      if ( m && m.tail ) {
        m.tail$.set(null);
      }
    },
    function findCurrentMemento() {
      var tail = this.memento;
      if ( ! tail )
        return tail;
      while ( true ) {
        if ( tail.tail == null ) {
          return tail;
        }
        tail = tail.tail;
      }
    }
  ],

  actions: [
    {
      name: 'back',
      // icon: 'arrow_back',
      isEnabled: function(pos) { return pos > 0; },
      code: function(X) {
        var isMementoSetWithView = false;

        //check if the class of the view to which current position points has property MEMENTO_HEAD
        //or if the view is object and it has mementoHead set
        //if so we need to set last not-null memento in the memento chain to null as we're going back
        if ( this.stack_[this.pos][0].class ) {
          var classObj = this.stack_[this.pos][0].class;
          if ( foam.String.isInstance(classObj) ) {
            classObj = foam.lookup(this.stack_[this.pos][0].class);
          }
          var obj = classObj.create(this.stack_[this.pos][0], X);
          if ( obj && obj.mementoHead ) {
            isMementoSetWithView = true;
          }
        } else {
          if ( this.stack_[this.pos][0].mementoHead ) {
            isMementoSetWithView = true;
          }
        }

        this.pos--;

        if ( isMementoSetWithView )
          this.deleteMemento(obj.mementoHead);
      }
    },
    {
      name: 'forward',
      // icon: 'arrow_forward',
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
