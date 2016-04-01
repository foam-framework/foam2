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

// TODO: make isAvailable and isEnabled by dynamic functions
foam.CLASS({
  package: 'foam.core',
  name: 'Action',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'label',
      expression: function(name) { return foam.string.labelize(name); }
    },
    {
      class: 'String',
      name: 'speechLabel',
      expression: function(label) { return label; }
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      help: 'Indicates if this is the default action.',
      value: false
    },
    {
      class: 'Function',
      name: 'isAvailable',
      label: 'Available',
      value: function() { return true; },
      help: 'Function to determine if action is available.'
    },
    {
      class: 'Function',
      name: 'isEnabled',
      label: 'Enabled',
      value: function() { return true; },
      help: 'Function to determine if action is enabled.'
    },
    {
      class: 'Function',
      name: 'code'
    }
  ],

  methods: [
    function maybeCall(X, that) {
      if ( this.isAvailable.call(that, this) && this.isEnabled.call(that, this) ) {
        this.code.call(that, X, this);
        that.pub('action', this.name, this);
        return true;
      }
      return false;
    },

    function installInProto(proto) {
      var action = this;
      proto[this.name] = function() {
        return action.maybeCall(this.X, this);
      };
    }
  ]
});

/** Supports Actions */
foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Action',
      name: 'actions',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Action must be named');
          return foam.core.Action.create({name: o.name, code: o});
        }
        return foam.lookup(this.of).create(o);
      }
    }
  ]
});
