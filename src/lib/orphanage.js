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

// Code that's either stale or not done, but we want to keep around for possible
// furure use.

/** Tracks dependencies for a dynamic function and invalidates is they change. */
foam.CLASS({
  package: 'foam.core',
  name: 'ExpressionSlot',
  implements: [ 'foam.core.Slot' ],

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
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        this.onDestroy(this.args[i].sub(this.invalidate));
      }
    },

    function get() {
      return this.value;
    },

    function set() { /* nop */ },

    function sub(l) {
      return this.SUPER('propertyChange', 'value', l);
    },

    function unsub(l) {
      this.SUPER('propertyChange', 'value', l);
    }
  ],

  listeners: [
    function invalidate() { this.clearProperty('value'); }
  ]
});
