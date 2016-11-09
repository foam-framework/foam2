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

/** The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class. */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  axioms: [ foam.pattern.Progenitor.create() ],

  methods: [
    /** Adds or updates the given value in the index */
    function put(/*o*/) {},

    /** Removes the given value from the index */
    function remove(/*o*/) {},

    // TODO: estimate is a class (static) method. Declare as such when possible
    /** Estimates the performance of this index given the number of items
      it will hold and the planned parameters. */
    function estimate(size, sink, skip, limit, order, predicate) {
      return size * size;
    },

    /** @return a Plan to execute a select with the given parameters */
    function plan(/*sink, skip, limit, order, predicate, root*/) {},

    /** @return the tail index instance for the given key. */
    function get(/*key*/) {},

    /** executes the given function for each index that was created from the given
      index factory (targetInstance.__proto__ === ofIndex). Function should take an index
      instance argument and return the index instance to replace it with.

      NOTE: size() is not allowed to change with this operation,
        since changing the type of index is not actually removing
        or adding items.
        Therefore: tail.size() == fn(tail).size() must hold.
    */
    // TODO: won't need if not allowing index structure changes, AltIndex heterogenious
    function mapOver(fn, ofIndex) {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink.
        cache allows indexes to store query state that is discarded once
        the select() is complete.
      <p>Note: order checking has replaced selectReverse().  */
    function select(/*sink, skip, limit, order, predicate, cache*/) { },

    /** Efficiently (if possible) loads the contents of the given DAO into the index */
    function bulkLoad(/*dao*/) {},
  ]
});



