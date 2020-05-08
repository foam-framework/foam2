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

foam.CLASS({
  package: 'foam.dao',
  name: 'MDAO',
  label: 'Indexed DAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'Indexed in-Memory DAO.',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.InvalidArgumentException',
    'foam.dao.index.AltIndex',
    'foam.dao.index.AutoIndex',
    'foam.dao.index.SetIndex',
    'foam.dao.index.TreeIndex',
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Or',
    'foam.mlang.sink.Explain',
    'foam.dao.index.MergePlan'
  ],

  properties: [
    {
      class: 'Class',
      name:  'of',
      required: true,
      postSet: function() {
        foam.assert(this.of.ID, "MDAO.of must be assigned a FOAM Class " +
          "with an 'id' Property or 'ids' array specified. Missing id in " +
          "class: " + ( this.of && this.of.id ));
      }
    },
    {
      class: 'Boolean',
      name: 'autoIndex'
    },
    {
      name: 'idIndex',
      transient: true
    },
    {
      /** The root IndexNode of our index. */
      name: 'index',
      transient: true
    }
  ],

  methods: [
    function init() {
      // adds the primary key(s) as an index, and stores it for fast find().
      this.addPropertyIndex();
      this.idIndex = this.index;

      if ( this.autoIndex ) {
        this.addIndex(this.AutoIndex.create({ idIndex: this.idIndex.index }));
      }
    },

    /**
     * Add a non-unique index
     * args: one or more properties
     **/
    function addPropertyIndex() {
      var props = Array.from(arguments);

      // Add ID to make each sure the object is uniquely identified
      props.push(this.of.ID);

      return this.addUniqueIndex_.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     * @private
     **/
    function addUniqueIndex_() {
      var index = this.ValueIndex.create();

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
        var prop = arguments[i];

        // Pass previous index as the sub-index of the next level up.
        // (we are working from leaf-most index up to root index in the list)
        index = prop.toIndex(index);
      }

      return this.addIndex(index);
    },

    function addIndex(index) {
      if ( ! this.index ) {
        this.index = index.createNode();
        return this;
      }

      // Upgrade single Index to an AltIndex if required.
      if ( ! this.AltIndex.isInstance(this.index.index) ) {
        this.index = this.AltIndex.create({
          delegates: [ this.index.index ] // create factory
        }).createNode({
          delegates: [ this.index ] // create an instance
        });
      }

      this.index.addIndex(index, this.index);

      return this;
    },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @param sink (optional) eof is called when loading is complete.
     **/
    function bulkLoad(dao) {
      var self = this;
      var sink = self.ArraySink.create();
      return dao.select(sink).then(function() {
        var a = sink.array;
        self.index.bulkLoad(a);
        for ( var i = 0; i < a.length; ++i ) {
          var obj = a[i];
        }
      });
    },

    function put_(x, obj) {
      var oldValue = this.findSync_(obj.id);
      if ( oldValue ) {
        this.index.remove(oldValue);
      }
      this.index.put(obj);
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function find_(x, objOrKey) {
      if ( objOrKey === undefined ) {
        return Promise.reject(this.InvalidArgumentException.create({
          message: '"key" cannot be undefined/null'
        }));
      }

      return Promise.resolve(this.findSync_(
          this.of.isInstance(objOrKey) ? objOrKey.id : objOrKey));
    },

    /** internal, synchronous version of find, does not throw */
    function findSync_(key) {
      var index = this.idIndex;
      index = index.get(key);

      if ( index && index.get() ) return index.get();

      return null;
    },

    function remove_(x, obj) {
      if ( ! obj || obj.id === undefined ) {
        return Promise.reject(this.ExternalException.create({ id: 'no_id' })); // TODO: err
      }

      var id   = obj.id;
      var self = this;

      var found = this.findSync_(id);
      if ( found ) {
        self.index.remove(found);
        self.pub('on', 'remove', found);
      }

      return Promise.resolve(obj);
    },

    function removeAll_(x, skip, limit, order, predicate) {
      if ( ! predicate ) predicate = this.True.create();
      var self = this;
      return self.where(predicate).select(self.ArraySink.create()).then(
        function(sink) {
          var a = sink.array;
          for ( var i = 0 ; i < a.length ; i++ ) {
            self.index.remove(a[i]);
            self.pub('on', 'remove', a[i]);
          }
          return Promise.resolve();
        }
      );
    },

    function select_(x, sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      var plan;
//console.log("----select");
      if ( this.Explain.isInstance(sink) ) {
        plan = this.index.plan(sink.arg1, skip, limit, order, predicate, this.index);
        sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
        sink && sink.eof && sink.eof();
        return Promise.resolve(sink);
      }

      predicate = predicate && predicate.toDisjunctiveNormalForm();
      if ( ! predicate || ! this.Or.isInstance(predicate) ) {
        plan = this.index.plan(sink, skip, limit, order, predicate, this.index);
      } else {
        plan = this.planForOr(sink, skip, limit, order, predicate);
      }

      var promise = [Promise.resolve()];
      plan.execute(promise, sink, skip, limit, order, predicate);
      return promise[0].then(
        function() {
          sink && sink.eof && sink.eof();
          return Promise.resolve(sink);
        },
        function(err) {
          return Promise.reject(err);
        }
      );
    },

    function planForOr(sink, skip, limit, order, predicate) {
      // if there's a limit, add skip to make sure we get enough results
      //   from each subquery. Our sink will throw out the extra results
      //   after sorting.
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );

      // This is an instance of OR, break up into separate queries
      var args  = predicate.args;
      var plans = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        // NOTE: we pass sink here, but it's not going to be the one eventually
        // used.
        plans.push(
          this.index.plan(sink, undefined, subLimit, order, args[i], this.index)
        );
      }

      return this.MergePlan.create({ of: this.of, subPlans: plans, predicates: args });
    },

    function toString() {
      return 'MDAO(' + this.cls_.name + ',' + this.index + ')';
    }
  ]
});
