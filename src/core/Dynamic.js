/*
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

/**
  Dynamic values are observable values which can change over time.
  <ul>Types of Dynamics include:
    <li>DynamicProperty:
    <li>DynamicExpression:
    <li>DynamicValue: to be implemented
</ul>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Dynamic', // ???: Rename AbstractDynamic or make an Interface
  extends: null,

  methods: [
    /**
      Link two Dynamics together, setting both to other's value.
      Returns a Destroyable which can be used to break the link.
    */
    function link(other) {
      var sub1 = this.follow(other);
      var sub2 = other.follow(this);

      return {
        destroy: function() {
          sub1.destroy();
          sub2.destroy();
          sub1 = sub2 = null;
        }
      };
    },

    /**
      Have this Dynamic dynamically follow other's value.
      Returns a Destroyable which can be used to cancel the binding.
    */
    function follow(other) {
      return other.subscribe(function() {
        this.set(other.get());
      }.bind(this));
    }
  ]
});


/**
  DynamicProperties export object properties as Dynamic values.
  Created with calling obj.prop$ or obj.dynamicProperty('prop').
  For internal use only.
 */
foam.CLASS({
  package: 'foam.core.internal',
  name: 'DynamicProperty',
  extends: 'foam.core.Dynamic',

  methods: [
    function initArgs() { },
    function get() {
      return this.prop.get(this.obj);
    },
    function set(value) {
      return this.prop.set(this.obj, value);
    },
    function getPrev() {
      return this.oldValue;
    },
    function setPrev(value) {
      return this.oldValue = value;
    },
    function subscribe(l) {
      return this.obj.subscribe('propertyChange', this.prop.name, l);
    },
    function unsubscribe(l) {
      this.obj.unsubscribe('propertyChange', this.prop.name, l);
    },
    function isDefined() {
      return this.obj.hasOwnProperty(this.prop.name);
    },
    function clear() {
      this.obj.clearProperty(this.prop.name);
    }
  ]
});


/** Tracks dependencies for a dynamic function and invalidates is they change. */
foam.CLASS({
  package: 'foam.core',
  name: 'DynamicExpression',
  implements: [ 'foam.core.Dynamic' ],

  properties: [
    'args',
    'fn',
    {
      name: 'value',
      factory: function() {
        return this.fn.apply(this, this.args.map(function(a) {
          return a.get();
        }));
      }
    }
  ],

  methods: [
    function init() {
      for ( var i = 0 ; i < this.args.length ; i++ )
        this.onDestroy(this.args[i].subscribe(this.invalidate));
    },

    function get() {
      return this.value;
    },

    function set() { /* nop */ },

    function subscribe(l) {
      return this.SUPER('propertyChange', 'value', l);
    },

    function unsubscribe(l) {
      this.SUPER('propertyChange', 'value', l);
    }
  ],

  listeners: [
    function invalidate() { this.clearProperty('value'); }
  ]
});

