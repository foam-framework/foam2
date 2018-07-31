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

  Each Index subclass also defines an IndexNode class. Index defines
  the structure of the index, including estimate() to gauge its
  probable performance for a query, while IndexNode implements the
  data nodes that hold the indexed items and plan and execute
  queries. For any particular operational Index, there may be
  many IndexNode instances:

<pre>
                 1---------> TreeIndex(id)
  MDAO: AltIndex 2---------> TreeIndex(propA) ---> TreeIndex(id) -------------> ValueIndex
        | 1x AltIndexNode    | 1x TreeIndexNode    | 14x TreeIndexNodes         | (DAO size)x ValueIndexNodes
           (2 alt subindexes)     (14 nodes)             (each has 0-5 nodes)
</pre>
  The base AltIndex has two complete subindexes (each holds the entire DAO).
  The TreeIndex on property A has created one TreeIndexNode, holding one tree of 14 nodes.
  Each tree node contains a tail instance of the next level down, thus
  the TreeIndex on id has created 14 TreeIndexNodes. Each of those contains some number
  of tree nodes, each holding one tail instance of the ValueIndex at the end of the chain.

*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',
  requires: [
    'foam.dao.index.TreeNode',
    'foam.dao.index.AutoIndexNode',
    'foam.dao.index.AltIndexNode',
    'foam.dao.index.ValueIndexNode',
    'foam.dao.index.TreeIndexNode',
    'foam.dao.index.CITreeIndexNode',
    'foam.dao.index.IndexNode',
    'foam.dao.index.SetIndexNode',
    'foam.dao.index.NullTreeNode',
    'foam.dao.index.ProxyIndexNode',
  ],

  properties: [
    {
      /**
       * The class type of the data nodes this index creates with
       * createNode(). By default it will be the Index class' name
       * with Node appended:
       * <p><code>MyIndex => MyIndexNode</code>
       */
      class: 'Class',
      name: 'nodeClass',
      factory: function() {
        return this.cls_.id + 'Node';
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

    function createNode(args) {
      args = args || {};
      args.index = this;
      return this.nodeClass.create(args, this);
    }
  ]
});


/**
  The IndexNode interface represents a piece of the index that actually
  holds data. A tree will create an index-node for each tree-node, so one
  Index will manage many IndexNode instances, each operating on part of
  the data in the DAO.

  For creation speed, do not require or import anything in a node class.
  Use the 'index' property to access requires and imports on the
  Index that created the node instance.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'IndexNode',

  properties: [
    {
      class: 'Simple',
      name: 'index'
    }
  ],

  methods: [
    /** Adds or updates the given value in the index */
    function put(obj) {},

    /** Removes the given value from the index */
    function remove(obj) {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(sink, skip, limit, order, predicate, root) {},

    /** @return the tail index instance for the given key. */
    function get(key) {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink.
        cache allows indexes to store query state that is discarded once
        the select() is complete.
      <p>Note: order checking has replaced selectReverse().  */
    function select(sink, skip, limit, order, predicate, cache) { },

    /** Efficiently (if possible) loads the contents of the given DAO into the index */
    function bulkLoad(dao) {}
  ]
});
