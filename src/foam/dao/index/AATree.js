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
  Represents one node's state in a binary tree. Each tree operation
  can rebalance the subtree or create a new node, so those methods
  return a tree node reference to replace the one called. It may be the
  same node, a different existing node, or a new node.
  <p>
  <code>
    // replace s.right with result of operations on s.right
    s.right = s.right.maybeClone(locked).split(locked);
  </code>
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeNode',

  properties: [
    // per node properties
    { class: 'Simple', name: 'key'   },
    { class: 'Simple', name: 'value' },
    { class: 'Simple', name: 'size'  },
    { class: 'Simple', name: 'level' },
    { class: 'Simple', name: 'left'  },
    { class: 'Simple', name: 'right' }
  ],

  methods: [

    /**
       Clone is only needed if a select() is active in the tree at the
       same time we are updating it.
    */
    function maybeClone(locked) {
      return locked ? this.clone() : this;
    },

    function clone() {
      var c = this.cls_.create();
      c.key   = this.key;
      c.value = this.value;
      c.size  = this.size;
      c.level = this.level;
      c.left  = this.left;
      c.right = this.right;
      return c;
    },

    function updateSize() {
      this.size = this.left.size + this.right.size + this.value.size();
    },

    /** @return Another node representing the rebalanced AA tree. */
    function skew(locked) {
      if ( this.left.level === this.level ) {
        // Swap the pointers of horizontal left links.
        var l = this.left.maybeClone(locked);

        this.left = l.right;
        l.right = this;

        this.updateSize();
        l.updateSize();

        return l;
      }

      return this;
    },

    /** @return a node representing the rebalanced AA tree. */
    function split(locked) {
      if (
          this.right.level       &&
          this.right.right.level &&
          this.level === this.right.right.level
      ) {
        // We have two horizontal right links.
        // Take the middle node, elevate it, and return it.
        var r = this.right.maybeClone(locked);

        this.right = r.left;
        r.left = this;
        r.level++;

        this.updateSize();
        r.updateSize();

        return r;
      }

      return this;
    },

    function predecessor() {
      if ( ! this.left.level ) return this;
      for ( var s = this.left ; s.right.level ; s = s.right ) {}
      return s;
    },

    function successor() {
      if ( ! this.right.level ) return this;
      for ( var s = this.right ; s.left.level ; s = s.left ) {}
      return s;
    },

    /**
       Removes links that skip levels.
       @return the tree with its level decreased.
    */
    function decreaseLevel(locked) {
      var expectedLevel = Math.min(
          this.left.level  ? this.left.level  : 0,
          this.right.level ? this.right.level : 0) + 1;

      if ( expectedLevel < this.level ) {
        this.level = expectedLevel;
        if ( this.right.level && expectedLevel < this.right.level ) {
          this.right = this.right.maybeClone(locked);
          this.right.level = expectedLevel;
        }
      }

      return this;
    },

    /** extracts the value with the given key from the index */
    function get(key, compare) {
      var r = compare(this.key, key);

      if ( r === 0 ) return this.value; // TODO... tail.get(this.value) ???

      return r > 0 ? this.left.get(key, compare) : this.right.get(key, compare);
    },

    /** scans the entire tree and returns all matches */
    function getAll(key, compare, retArray) {
      var r = compare(this.key, key);

      if ( r === 0 ) retArray.push(this.value);

      this.left.getAll(key, compare, retArray);
      this.right.getAll(key, compare, retArray);
    },

    function putKeyValue(key, value, compare, dedup, locked) {
      var s = this.maybeClone(locked);

      var r = compare(s.key, key);

      if ( r === 0 ) {
        dedup(value, s.key);

        s.size -= s.value.size();
        s.value.put(value);
        s.size += s.value.size();
      } else {
        var side = r > 0 ? 'left' : 'right';

        if ( s[side].level ) s.size -= s[side].size;
        s[side] = s[side].putKeyValue(key, value, compare, dedup, locked);
        s.size += s[side].size;
      }

      return s.split(locked).skew(locked);
    },

    function removeKeyValue(key, value, compare, locked, nullNode) {
      var s = this.maybeClone(locked);
      var side;
      var r = compare(s.key, key);

      if ( r === 0 ) {
        s.size -= s.value.size();
        s.value.remove(value);

        // If the sub-Index still has values, then don't
        // delete this node.
        if ( s.value && s.value.size() > 0 ) {
          s.size += s.value.size();
          return s;
        }

        // If we're a leaf, easy, otherwise reduce to leaf case.
        if ( ! s.left.level && ! s.right.level ) {
          return nullNode;
        }

        side = s.left.level ? 'left' : 'right';

        // TODO: it would be faster if successor and predecessor also deleted
        // the entry at the same time in order to prevent two traversals.
        // But, this would also duplicate the delete logic.
        var l = side === 'left' ?
            s.predecessor() :
            s.successor()   ;

        s.key = l.key;
        s.value = l.value;

        s[side] = s[side].removeNode(l.key, compare, locked);
      } else {
        side = r > 0 ? 'left' : 'right';

        s.size -= s[side].size;
        s[side] = s[side].removeKeyValue(key, value, compare, locked, nullNode);
        s.size += s[side].size;
      }

      // Rebalance the tree. Decrease the level of all nodes in this level if
      // necessary, and then skew and split all nodes in the new level.
      s = s.decreaseLevel(locked).skew(locked);
      if ( s.right.level ) {
        s.right = s.right.maybeClone(locked).skew(locked);
        if ( s.right.right.level ) {
          s.right.right = s.right.right.maybeClone(locked).skew(locked);
        }
      }

      s = s.split(locked);
      s.right = s.right.maybeClone(locked).split(locked);

      return s;
    },

    function removeNode(key, compare, locked) {
      var s = this.maybeClone(locked);

      var r = compare(s.key, key);

      if ( r === 0 ) return s.left.level ? s.left : s.right;

      var side = r > 0 ? 'left' : 'right';

      s.size -= s[side].size;
      s[side] = s[side].removeNode(key, compare, locked);
      s.size += s[side].size;

      return s;
    },


    function select(sink, skip, limit, order, predicate, cache) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        skip[0] -= this.size;
        return;
      }

      this.left.select(sink, skip, limit, order, predicate, cache);

      this.value.select(sink, skip, limit,
        order && order.orderTail(), predicate, cache);

      this.right.select(sink, skip, limit, order, predicate, cache);
    },


    function selectReverse(sink, skip, limit, order, predicate, cache) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        //console.log('reverse skipping: ', this.key);
        skip[0] -= this.size;
        return;
      }

      this.right.selectReverse(sink, skip, limit, order, predicate, cache);

      // select() will pick reverse or not based on order
      this.value.select(sink, skip, limit,
        order && order.orderTail(), predicate, cache);

      this.left.selectReverse(sink,  skip, limit, order, predicate, cache);
    },

    function gt(key, compare) {
      var s = this;
      var r = compare(key, s.key);

      if ( r < 0 ) {
        var l = s.left.gt(key, compare);
        var copy = s.clone();
        copy.size = s.size - s.left.size + l.size;
        copy.left = l;
        return copy;
      }

      if ( r > 0 ) return s.right.gt(key, compare);

      return s.right;
    },

    function gte(key, compare, nullNode) {
      var s = this;
      var copy;
      var r = compare(key, s.key);

      if ( r < 0 ) {
        var l = s.left.gte(key, compare, nullNode);
        copy = s.clone();
        copy.size = s.size - s.left.size + l.size,
        copy.left = l;
        return copy;
      }

      if ( r > 0 ) return s.right.gte(key, compare, nullNode);

      copy = s.clone();
      copy.size = s.size - s.left.size,
      copy.left = nullNode;
      return copy;
    },

    function lt(key, compare) {
      var s = this;
      var r = compare(key, s.key);

      if ( r > 0 ) {
        var rt = s.right.lt(key, compare);
        var copy = s.clone();
        copy.size = s.size - s.right.size + rt.size;
        copy.right = rt;
        return copy;
      }

      if ( r < 0 ) return s.left.lt(key, compare);

      return s.left;
    },

    function lte(key, compare, nullNode) {
      var s = this;
      var copy;
      var r = compare(key, s.key);

      if ( r > 0 ) {
        var rt = s.right.lte(key, compare, nullNode);
        copy = s.clone();
        copy.size = s.size - s.right.size + rt.size;
        copy.right = rt;
        return copy;
      }

      if ( r < 0 ) return s.right.lte(key, compare, nullNode);

      copy = s.clone();
      copy.size = s.size - s.right.size;
      copy.right = nullNode;
      return copy;
    }
  ]
});


/**
  Guards the leaves of the tree. Once instance is created per instance of
  TreeIndex, and referenced by every tree node. Most of its methods are
  no-ops, cleanly terminating queries and other tree operations.
  <p>
  NullTreeNode covers creation of new nodes: when a put value hits the
  nullNode, a new TreeNode is returned and the caller replaces the
  nullNode reference with the new node.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NullTreeNode',

  properties: [
    {
      /**
        The nullNode for a given tree creates all the new nodes, so it needs
        the factory for the tail index to create inside each new node.
      */
      class: 'Simple',
      name: 'tail'
    },
    {
      /**
        The tree node factory is used to create new, empty tree nodes. They
        will be initialized with a new tail index from tail.
      */
      class: 'Simple',
      name: 'treeNode'
    },
    {
      class: 'Simple',
      name: 'left',
      //getter: function() { return undefined; }
    },
    {
      class: 'Simple',
      name: 'right',
      //getter: function() { return undefined; }
    },
    {
      class: 'Simple',
      name: 'size',
      //getter: function() { return 0; }
    },
    {
      class: 'Simple',
      name: 'level',
      //getter: function() { return 0; }
    }
  ],

  methods: [
    function init() {
      this.left  = undefined;
      this.right = undefined;
      this.size  = 0;
      this.level = 0;
    },

    function clone()         { return this; },
    function maybeClone()    { return this; },
    function skew(locked)    { return this; },
    function split(locked)   { return this; },
    function decreaseLevel() { return this; },
    function get()           { return undefined; },
    function updateSize()    {  },

    /** Add a new value to the tree */
    function putKeyValue(key, value) {
      var subIndex = this.tail.createNode();
      subIndex.put(value);
      var n = this.treeNode.create();
      n.left  = this;
      n.right = this;
      n.key   = key;
      n.value = subIndex;
      n.size  = 1;
      n.level = 1;
      return n;
    },

    function removeKeyValue() { return this; },
    function removeNode()     { return this; },
    function select()         { },
    function selectReverse()  { },

    function gt()   { return this; },
    function gte()  { return this; },
    function lt()   { return this; },
    function lte()  { return this; },

    function getAll()  { return; },

    function bulkLoad_(a, start, end, keyExtractor) {
      if ( end < start ) return this;

      var tree = this;
      var m    = start + Math.floor((end-start+1) / 2);
      tree = tree.putKeyValue(keyExtractor(a[m]), a[m]);

      tree.left  = tree.left.bulkLoad_(a, start, m-1, keyExtractor);
      tree.right = tree.right.bulkLoad_(a, m+1, end, keyExtractor);
      tree.size += tree.left.size + tree.right.size;

      return tree;
    }
  ]
});
