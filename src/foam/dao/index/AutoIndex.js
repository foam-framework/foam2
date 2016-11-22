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


/** An Index which adds other indices as needed. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan'
  ],

  properties: [
    {
      name: 'properties',
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

    function addPropertyIndex(prop) {
      if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(prop) ) {
        prop = prop.arg1;
      }
      console.log('Adding AutoIndex : ', prop.id);
      this.properties[prop.name] = true;
      this.mdao.addPropertyIndex(prop);
    },
    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate) {
      if ( order ) {
        // find name of property to order by
        var name = ( this.Property.isInstance(order) ) ? order.name :
          ( order.arg1 && order.arg1.name ) || null;
        // if no index added for it yet, add one
        if ( name && ! this.properties[name] ) {
          this.addPropertyIndex(order);
        }
        // } else if ( predicate ) {
        // TODO: check for property in predicate
      }
      return this.NoPlan.create();
    },
    function toString() {
      return 'AutoIndex()';
    }
  ]
});

