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


/** An Index which adds other indices as needed. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Or',
  ],

  properties: [
    {
      name: 'existingIndexes',
      factory: function() { return {}; }
    },
    {
      name: 'mdao'
    }
  ],

  methods: [
    function put() { },

    function remove() { },

    function bulkLoad() { return 'auto'; },

    function addIndex(prop) {
      if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(prop) ) {
        prop = prop.arg1;
      }
      console.log('Adding AutoIndex : ', prop.id);
      this.existingIndexes[prop.name] = prop;
      this.mdao.addIndex(prop);
    },
    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate) {
      if ( order ) {
        // TODO: compound comparator case
        // find name of property to order by
        var name = ( this.Property.isInstance(order) ) ? order.name :
          ( order.arg1 && order.arg1.name ) || null;
        // if no index added for it yet, add one
        if ( name && ! this.existingIndexes[name] ) {
          this.addIndex(order);
        }
      } else if ( predicate ) {
        // collect the tree of ANDed/ORed properties from the predicate
        var inputs = this.collectInputs(predicate);
        if ( inputs ) {
          // create the index to optimize the predicate, if none existing
          console.log("inputs: ", inputs.toString());
        }
      }
      return this.NoPlan.create();
    },

    function toString() {
      return 'AutoIndex()';
    },

    function collectInputs(predicate) {
      // TODO: invert this to be methods on mlangs
      if ( this.And.isInstance(predicate) ) {
        var ret = { name: '__AND__' };
        for ( var i = 0; i < predicate.args.length; i++ ) {
          var p = this.collectInputs(predicate.args[i]);
          if ( p ) ret[p.name] = p;
        }
        return ret;
      } else if ( this.Or.isInstance(predicate) ) {
        var ret = { name: '__OR__' };
        for ( var i = 0; i < predicate.args.length; i++ ) {
          var p = this.collectInputs(predicate.args[i]);
          if ( p ) ret[p.name] = p;
        }
        return ret;
      } else {
        var arg1 = predicate.arg1;
        if ( arg1 && this.Property.isInstance(arg1) ) {
          return arg1;
        }
      }
    }
  ]
});








