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
  The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  imports: [
    'lookup'
  ],
  properties: [
    {
      class: 'Class',
      name: 'tailClass',
      factory: function() {
        // Supply an IndexTail Class for each Index subclass
        return 'foam.dao.index.IndexTail';
      }
    }
  ],
  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      /** Estimates the performance of this index given the number of items
        it will hold and the planned parameters. */
      return size * size; // n^2 is a good worst-case estimate by default
    },


    function toPrettyString(indent) {
      /** Output a minimal, human readable, indented (2 spaces per level)
        description of the index structure */
    },

    function spawn(args) {
      var cls = this.tailClass;
      return cls.create(args, this); // TODO: third arg for proto?
    }
  ]
});

/**
  The index tail interface represents a piece of the index that actually
  holds data. A tree will create a tail for each node, so one Index will
  create many tail instances, each operating on part of the data in the DAO.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'IndexTail',

//   axioms: [
//     'foam.dao.index.SharedProto?', // create(args, ctx, proto)?
//   ],

  methods: [
    /** Adds or updates the given value in the index */
    function put(/*o*/) {},

    /** Removes the given value from the index */
    function remove(/*o*/) {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(/*sink, skip, limit, order, predicate, root*/) {},

    /** @return the tail index instance for the given key. */
    function get(/*key*/) {},

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



