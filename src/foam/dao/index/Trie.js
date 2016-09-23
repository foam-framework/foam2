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

/**
  Represents one node's state in a trie. The trie is not balanced
  and does not support ordering. It is good for substring matching.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TrieNode',

  properties: [
    // per node properties
    { class: 'Simple', name: 'key'   },
    { class: 'Simple', name: 'tail' },
    { class: 'Simple', name: 'size'  },
    { class: 'Simple', name: 'children' },

  ],

  methods: [

    function create(args) {
      var c = Object.create(this);
      c.init && c.init();
      args && c.copyFrom(args);
      return c;
    },

    function init() {
      this.children  = { __proto__: null };
      this.size = 1;
    },

    /** Nodes do a shallow clone */
    function clone() {
      var c = this.__proto__.create();
      c.key   = this.key;
      c.value = this.value;
      c.size  = this.size;
      c.children = { __proto__: null };
      for ( var key in this.children ) {
        c.children[key] = this.children[key];
      }
      return c;
    },

    /**
       Clone is only needed if a select() is active in the tree at the
       same time we are updating it.
    */
    function maybeClone(locked) {
      return locked ? this.clone() : this;
    },

    /** extracts the value with the given key from the index */
    function get(/* array */ key, offset) {
      if ( offset >= key.length ) return this.tail;
      // TODO: When key stores multiple chars for this node, check for match
      var child = this.children[key[offset]];
      if ( child ) {
        return child.get(key, offset + 1); // next character
      }
    },

    function putKeyValue(/* array */key, value, offset, nodeFactory, tailFactory, locked) {      
      var s = this.maybeClone(locked);

      // if we're at the end of the key, our tail is the subindex to use
      if ( offset >= key.length ) {
        if ( s.tail ) {
          s.size -= s.tail.size();      
        } else {
          s.tail = tailFactory.create();
        }
        s.tail.put(value);
        s.size += s.tail.size();    
        //console.log("put ", key); 
      } else {
        var k = key[offset];
        // TODO: compress empty 'value' nodes into multi-character keyed nodes
        var child = s.children[k];
        if ( child ) {
          s.size -= child.size;
          child = child.putKeyValue(key, value, offset + 1, nodeFactory, tailFactory, locked); // next character
          s.children[k] = child;
          s.size += child.size;
        } else {
          var newchild = nodeFactory.create({ key: k });
          newchild.putKeyValue(key, value, offset + 1, nodeFactory, tailFactory, false); // new node, ignore 'locked'          
          s.children[k] = newchild;
          s.size += newchild.size;
        }
      }  
          
      return s;
    },

    function removeKeyValue(/* array */key, value, offset, locked) {      
      var s = this.maybeClone(locked);
      
      // if we're at the end of the key, our tail is the subindex to use
      if ( offset >= key.length ) {
        s.tail.remove(value);
        if ( s.tail.size() < 1 ) {
          s.tail = null;
        }
      } else {     
        var k = key[offset];
      
        var child = s.children[k];
        if ( child ) {
           child = child.removeKeyValue(key, value, offset + 1, locked); // next character
           if ( child ) {
             s.children[k] = child;
           } else {
             delete s.children[k];
           }
           s.size -= 1;
        } 
      }
      // if empty, remove self
      if ( Object.keys(s.children).length < 1 && ! s.tail ) {
        return;
      }
    
      return s;
    },

    function select(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        skip[0] -= this.size;
        return;
      }

      var cs = this.children;
      for ( var c in cs ) {
        cs[c].select(sink, skip, limit, order, predicate);
      }
      this.value && this.value.select(sink, skip, limit, order, predicate);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;


      if ( skip && skip[0] >= this.size && ! predicate ) {
        console.log('reverse skipping: ', this.key);
        skip[0] -= this.size;
        return;
      }

      var cs = this.children;
      for ( var c in cs ) {
        cs[c].select(sink, skip, limit, order, predicate);
      }
      this.value && this.value.select(sink, skip, limit, order, predicate);
    },
    
    function print() {
      var cs = this.children;
      var ret = "{n:"+this.key+(this.value?" V":"") + ":";
      for ( var c in cs ) {
        ret += cs[c].print()+","
      }
      ret += "}";
      return ret;
    },
  ]
});


