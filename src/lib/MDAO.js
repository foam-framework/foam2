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

/* Indexed Memory-based DAO. */

foam.CLASS({
  extends: 'foam.dao.AbstractDAO',
  package: 'foam.dao',
  name: 'MDAO',
  label: 'Indexed DAO',
  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.mlang.predicate.Eq',
    'foam.dao.ArraySink',
  ],
  properties: [
    {
      name:  'of',
      required: true
    },
    {
      type: 'Boolean',
      name: 'autoIndex',
      value: false
    }
  ],

  methods: [

    function init() {
      this.map = {};
      // TODO(kgr): this doesn't support multi-part keys, but should (foam2: still applies!)
      // TODO: generally sort out how .ids is supposed to work
      this.index = foam.dao.index.TreeIndex.create({
          prop: this.of.getAxiomByName(( this.of.ids && this.of.ids[0] ) || 'id' ),
          tailFactory: foam.dao.index.ValueIndex
      });

      if ( this.autoIndex ) {
        this.addRawIndex(foam.dao.index.AutoIndex.create({ mdao: this }));
      }
    },

    /**
     * Add a non-unique index
     * args: one or more properties
     **/
    function addIndex() {
      var props = foam.Array.argsToArray(arguments);

      if ( ! this.of.ids ) {// throw "Undefined index"; // TODO: err
        this.of.ids = ['id'];
      }

      // Add on the primary key(s) to make the index unique.
      for ( var i = 0 ; i < this.of.ids.length ; i++ ) {
        props.push(this.of.getAxiomByName(this.of.ids[i]));
        if ( ! props[props.length - 1] ) throw "Undefined index property"; // TODO: err
      }

      return this.addUniqueIndex.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     **/
    function addUniqueIndex() {
      var proto = foam.dao.index.ValueIndex;
      var index = foam.dao.index.ValueIndex.create();
      //var siFactory = proto;

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
        var prop = arguments[i];

        // TODO: the index prototype should be in the property
        proto = prop.type == 'Array[]' ?
          foam.dao.index.SetIndex  :
          foam.dao.index.TreeIndex ;
        index = proto.create({ prop: prop, tailFactory: index });
      }

      return this.addRawIndex(index);
    },

    // TODO: name 'addIndex' and renamed addIndex
    function addRawIndex(index) {
      // Upgrade single Index to an AltIndex if required.
      if ( ! foam.dao.index.AltIndex.isInstance(this.index) ) {
        this.index = foam.dao.index.AltIndex.create({ delegates: [this.index] });
      }

      this.index.addIndex(index);

      return this;
    },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @arg sink (optional) eof is called when loading is complete.
     **/
    function bulkLoad(dao, sink) {
      var self = this;
      return new Promise(function(resolve, reject) {
        dao.select().then(function() {
          self.index.bulkLoad(this);
          resolve();
        });
      })
    },

    function put(obj) {
      var oldValue = this.map[obj.id];
      if ( oldValue ) {
        this.index.remove(oldValue);
        this.index.put(obj);
      } else {
        this.index.put(obj);
      }
      this.map[obj.id] = obj;
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function findObj_(key) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var obj = self.map[key];
        // var obj = this.index.get(key);
        if ( obj ) {
          resolve(obj);
        } else {
          reject(self.ObjectNotFoundException.create({ id: key })); // TODO: err
        }
      });
    },

    function find(key) {
      var self = this;
      if ( key == undefined ) {
        reject(self.InternalException.create({ id: key })); // TODO: err
        return;
      }
      var foundObj = null;
      return this.findObj_(key);
      // TODO: How to handle multi value primary keys?
      // return new Promise(function(resolve, reject) {
//         self.where(self.Eq.create({ arg1: self.of.getAxiomByName(
//             ( self.of.ids && self.of.ids[0] ) || 'id' ), arg2: key })
//           ).limit(1).select({
//           put: function(obj) {
//             foundObj = obj;
//             resolve(obj);
//           },
//           eof: function() {
//             if ( ! foundObj ) {
//               reject(self.ObjectNotFoundException.create({ id: key })); // TODO: err
//             }
//           },
//           error: function(e) {
//             reject(self.InternalException.create({ id: key })); // TODO: err
//           }
//         });
//       });
    },

    function remove(obj) {
      if ( ! obj || ! obj.id ) {
        return Promise.reject(this.ExternalException.create({ id: 'no_id' })); // TODO: err
      }
      var id = obj.id;
      var self = this;

      return this.find(id).then(
        function(obj) {
          self.index.remove(obj);
          delete self.map[obj.id];
          self.pub('on', 'remove', obj);
          return Promise.resolve();
        },
        function(err) {
          if ( self.ObjectNotFoundException.isInstance(err) ) {
            return Promise.resolve(); // not found error is actually ok
          } else {
            return Promise.reject(err);
          }
        }
      );
    },

    function removeAll(skip, limit, order, predicate) {
      if (!predicate) predicate = this.True;
      var self = this;
      return self.where(predicate).select(self.ArraySink.create()).then(
        function(sink) {
          var a = sink.a;
          for ( var i = 0 ; i < a.length ; i++ ) {
            self.index.remove(a[i]);
            delete self.map[a[i].id];
            self.pub('on', 'remove', a[i]);
          }
          return Promise.resolve();
        }
      );
    },

    function select(sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();

      if ( foam.mlang.sink.Explain && foam.mlang.sink.Explain.isInstance(sink) ) {
        var plan = this.index.plan(sink.arg1, skip, limit, order, predicate);
        sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
        sink && sink.eof && sink.eof();
        return Promise.resolve(sink)
      }

      var plan = this.index.plan(sink, skip, limit, order, predicate);

      var promise = [Promise.resolve()];
      plan.execute(promise, sink, skip, limit, order, predicate);
      return promise[0].then(
        function() {
          sink && sink.eof && sink.eof();
          return Promise.resolve(sink);
        },
        function(err) {
          sink && sink.error && sink.error(err);
          return Promise.reject(err);
        }
      );
    },

    function toString() {
      return 'MDAO(' + this.cls_.name + ',' + this.index + ')';
    }
  ]
});
