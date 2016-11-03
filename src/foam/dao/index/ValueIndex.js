/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  An Index which holds only a single value. This class also functions as its
  own execution Plan, since it only has to return the single value.
**/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndex',
  extends: 'foam.dao.index.Index',
  implements: [ 'foam.dao.index.Plan' ],

  properties: [
    { class: 'Simple',  name: 'value' },
    { name: 'cost', value: 1 }
  ],

  methods: [
    // from plan
    function execute(promise, sink) {
      /** Note that this will put(undefined) if you remove() the item but
        leave this ValueIndex intact. Most usages of ValueIndex will clean up
        the ValueIndex itself when the value is removed. */
      sink.put(this.value);
    },

    function toString() {
      return "ValueIndex_Plan(cost=1, value:" + this.value + ")";
    },

    // from Index
    function put(s) { this.value = s; },
    function remove() { this.value = undefined; },
    function get() { return this.value; },
    function size() { return typeof this.value === 'undefined' ? 0 : 1; },
    function plan() { return this; },

    function select(sink, skip, limit, order, predicate) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      this.select(sink, skip, limit, order, predicate);
    }
  ]
});
