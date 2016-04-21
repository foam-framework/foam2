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


/** Represents one node's state in a binary tree */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeNode',

  properties: [
    { class: 'Simple', name: 'key'   },
    { class: 'Simple', name: 'value' },
    { class: 'Simple', name: 'size'  },
    { class: 'Simple', name: 'level' },
    { class: 'Simple', name: 'left'  },
    { class: 'Simple', name: 'right' },

    { class: 'Simple', name: 'index' }, // TODO: replace with export/import?
  ],

  methods: [
    function init() {
      this.left  = this.left  || foam.dao.index.NullTreeNode.create(this);
      this.right = this.right || foam.dao.index.NullTreeNode.create(this);
    },

    /** Nodes do a shallow clone */
    function clone() {
      var c = this.cls_.create();
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0; i < ps.length; ++i ) {
        var name = ps[i].name;
        var value = this[name];
        if ( typeof value !== 'undefined' ) c[name] = value;
      }
      return c;
    },

    /** Clone is only needed if a select() is active in the tree at the
      same time we are updating it. */
    function maybeClone() {
      return ( this.index.selectCount > 0 ) ? this.clone() : this;
    },

    function updateSize() {
      this.size = this.left.size +
        this.right.size + this.value.size();
    },

    /** @return Another node representing the rebalanced AA tree. */
    function skew() {
      if ( this.left.level === this.level ) {
        // Swap the pointers of horizontal left links.
        var l = this.left.maybeClone();

        this.left = l.right;
        l.right = this;

        this.updateSize();
        l.updateSize();

        return l;
      }

      return this;
    },

    /** @return a node representing the rebalanced AA tree. */
    function split() {
      if ( this.right.level && this.right.right.level && this.level === this.right.right.level ) {
        // We have two horizontal right links.  Take the middle node, elevate it, and return it.
        var r = this.right.maybeClone();

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
      for ( var s = this.left ; s.right.level ; s = s.right );
        return s;
    },
    function successor() {
      if ( ! this.right.level ) return this;
      for ( var s = this.right ; s.left.level ; s = s.left );
        return s;
    },

    /** Removes links that skip levels.
      @return the tree with its level decreased. */
    function decreaseLevel() {
      var expectedLevel = Math.min(this.left.level ? this.left.level : 0, this.right.level ? this.right.level : 0) + 1;

      if ( expectedLevel < this.level ) {
        this.level = expectedLevel;
        if ( this.right.level && expectedLevel < this.right.level ) {
          this.right = this.right.maybeClone();
          this.right.level = expectedLevel;
        }
      }
      return this;
    },

    /** extracts the value with the given key from the index */
    function get(key) {
      var r = this.index.compare(this.key, key);

      if ( r === 0 ) return this.value; // TODO... tail.get(this.value) ???

      return r > 0 ? this.left.get(key) : this.right.get(key);
    },

    function putKeyValue(key, value) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) {
        this.index.dedup(value, s.key);

        s.size -= s.value.size();
        s.value.put(value);
        s.size += s.value.size();
      } else {
        var side = r > 0 ? 'left' : 'right';

        if ( s[side].level ) s.size -= s[side].size;
        s[side] = s[side].putKeyValue(key, value);
        s.size += s[side].size;
      }

      return s.split().skew();
    },

    function removeKeyValue(key, value) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) {
        s.size -= s.value.size();
        s.value.remove(value);

        // If the sub-Index still has values, then don't
        // delete this node.
        if ( s.value ) {
          s.size += s.value.size();
          return s;
        }

        // If we're a leaf, easy, otherwise reduce to leaf case.
        if ( ! s.left.level && ! s.right.level ) {
          return foam.dao.index.NullTreeNode.create({ index: this.index });
        }

        var side = s.left.level ? 'left' : 'right';

        // TODO: it would be faster if successor and predecessor also deleted
        // the entry at the same time in order to prevent two traversals.
        // But, this would also duplicate the delete logic.
        var l = side === 'left' ?
          s.predecessor() :
          s.successor()   ;

        s.key = l.key;
        s.value = l.value;

        s[side] = s[side].removeNode(l.key);
      } else {
        var side = r > 0 ? 'left' : 'right';

        s.size -= s[side].size;
        s[side] = s[side].removeKeyValue(key, value);
        s.size += s[side].size;
      }

      // Rebalance the tree. Decrease the level of all nodes in this level if
      // necessary, and then skew and split all nodes in the new level.
      s = s.decreaseLevel().skew();
      if ( s.right.level ) {
        s.right = s.right.maybeClone().skew();
        if ( s.right.right.level ) s.right.right = s.right.right.maybeClone().skew();
      }
      s = s.split();
      s.right = s.right.maybeClone().split();

      return s;
    },

    function removeNode(key) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) return s.left.level ? s.left : s.right;

      var side = r > 0 ? 'left' : 'right';

      s.size -= s[side].size;
      s[side] = s[side].removeNode(key);
      s.size += s[side].size;

      return s;
    },

    function select(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        skip[0] -= this.size;
        return;
      }
      this.left.select(sink, skip, limit, order, predicate);
      this.value.select(sink, skip, limit, order, predicate);
      this.right.select(sink, skip, limit, order, predicate);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size ) {
        skip[0] -= this.size;
        return;
      }

      this.right.selectReverse(sink, skip, limit, order, predicate);
      this.value.selectReverse(sink, skip, limit, order, predicate);
      this.left.selectReverse(sink, skip, limit, order, predicate);
    },

    function findPos(key, incl) {
      var r = this.compare(this.key, key);
      if ( r === 0 ) {
        return incl ?
          this.left.size :
          this.size - this.right.size;
      }
      return r > 0 ?
        this.left.findPos(key, incl) :
        this.right.findPos(key, incl) + this.size - this.right.size;
    },


  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'NullTreeNode',
  extends: 'foam.dao.index.TreeNode',
  axioms: [
    foam.pattern.Multiton.create({
      property: foam.dao.index.TreeNode.INDEX
    })
  ],

  methods: [
    function init() {
      this.left  = undefined;
      this.right = undefined;
      this.size = 0;
      this.level = 0;
    },

    function clone() {         return this; },
    function maybeClone() {    return this; },
    function skew() {          return this; },
    function split() {         return this; },
    function decreaseLevel() { return this; },
    function get() {           return undefined; },
    function updateSize() { },

    /** Add a new value to the tree */
    function putKeyValue(key, value) {
      var subIndex = this.index.subIndexModel.create();
      subIndex.put(value);
      return foam.dao.index.TreeNode.create({
        key: key,
        value: subIndex,
        size: 1,
        level: 1,
        index: this.index
      });
    },
    function removeKeyValue(key, value) { return this; },
    function removeNode(key) { return this; },
    function select() { },
    function selectReverse() {},
    function findPos() { return 0; },

    function bulkLoad_(a, start, end) {
      if ( end < start ) return this;

      var tree = this;
      var m    = start + Math.floor((end-start+1) / 2);
      tree = tree.putKeyValue(this.index.prop.f(a[m]), a[m]);

      tree.left = tree.left.bulkLoad_(a, start, m-1);
      tree.right = tree.right.bulkLoad_(a, m+1, end);
      tree.size += tree.left.size + tree.right.size;

      return tree;
    },
  ]


});

