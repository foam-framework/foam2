/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.dao.grid',
  name: 'ManyToManyGridDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: `A DAO that delegates to the "target" side of a many-to-many
      relationship, and maintains a reference to a "sources" DAO of "source"
      objects. This DAO is "of":

      { target, data: Boolean[](is "target" related to ith source) }.

      The DAO is designed for adapting to table views of a relationship grid.
      The preprocessing is implemented at the DAO layer so that it can easily
      pushed off the UI thread.`,

  requires: [ 'foam.dao.ArraySink' ],

  imports: [ 'relationship' ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.__context__[this.relationship.targetDAOKey];
      }
    },
    {
      class: 'Class',
      name: 'junctionCls',
      factory: function() {
        return this.__context__.lookup(this.relationship.junctionModel);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceDAO',
      factory: function() {
        return this.__context__[this.relationship.sourceDAOKey];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO',
      factory: function() {
        return this.__context__[this.relationship.junctionDAOKey];
      }
    },
    {
      class: 'String',
      name: 'gridClsId',
      factory: function() {
        return this.relationship.junctionModel + 'Grid';
      }
    },
    {
      class: 'Class',
      name: 'of',
      value: 'foam.dao.grid.ManyToManyGridRecord'
    }
  ],

  methods: [
    function find_(x, o) {
      return this.delegate.find_(x, o).
          then(this.addSourcesToTarget.bind(this, x));
    },
    function select_(x, sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      return this.delegate.
          select_(x, this.ArraySink.create(), skip, limit, order, predicate).
          then(this.addSourcesToTargets.bind(this, x, sink)).
          then(function() { sink && sink.eof && sink.eof(); return sink; });
    }
  ],

  listeners: [
    function addSourcesToTarget(x, target) {
      var Cls = this.of;
      return this.sourceDAO.select().
          then(this.getDataForTarget.bind(this, target)).
          then(function(data) {
            return Cls.create({ target: target, data: data }, x);
          });
    },

    function addSourcesToTargets(x, sink, localSink) {
      var put = sink.put.bind(sink);
      var array = localSink.array;
      var promises = new Array(array.length);
      for ( var i = 0; i < array.length; i++ ) {
        promises.push(this.addSourcesToTarget(x, array[i]).then(put));
      }
      return Promise.all(promises);
    },

    function getDataForTarget(target, sink) {
      var sources = sink.array;
      return Promise.all(
          sources.map(this.getDatumForTarget.bind(this, target)));
    },
    
    function getDatumForTarget(target, source) {
      return this.junctionDAO.where(this.AND(
          this.EQ(this.junctionCls.SOURCE_ID, source.id),
          this.EQ(this.junctionCls.TARGET_ID, target.id))).select().
          then(function(arraySink) { return !! arraySink.array[0]; });
    }
  ]
});
