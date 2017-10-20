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

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAO',
  implements: [ 'foam.dao.DAO' ],

  documentation: 'Abstract base class for implementing DAOs.',

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.FilteredDAO',
    'foam.dao.InternalException',
    'foam.dao.LimitedDAO',
    'foam.dao.LimitedListener',
    'foam.dao.LimitedSink',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.OrderedDAO',
    'foam.dao.OrderedListener',
    'foam.dao.OrderedSink',
    'foam.dao.PipeSink',
    'foam.dao.PredicatedListener',
    'foam.dao.PredicatedSink',
    'foam.dao.ProxyDAO',
    'foam.dao.ResetListener',
    'foam.dao.SkipDAO',
    'foam.dao.SkipListener',
    'foam.dao.SkipSink'
  ],

  topics: [
    {
      name: 'on',
      topics: [
        'put',
        'remove',
        'reset'
      ]
    }
  ],

  properties: [
    {
      /**
        Set to the name or class instance of the type of object the DAO
        will store.
      */
      class: 'Class',
      javaType: 'foam.core.ClassInfo',
      name: 'of'
    }
  ],

  methods: [
    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'inX',
      code: function(x) {
        return this.ProxyDAO.create({delegate: this}, x);
      }
    },

    {
      /**
        Returns a filtered DAO that only returns objects which match the
        given predicate.
      */
      name: 'where',
      code: function where(p) {
        return this.FilteredDAO.create({
          delegate: this,
          predicate: p
        });
      }
    },

    {
      /**
        Returns a filtered DAO that orders select() by the given
        ordering.
      */
      name: 'orderBy',
      code: function orderBy() {
        return this.OrderedDAO.create({
          delegate: this,
          comparator: foam.compare.toCompare(Array.from(arguments))
        });
      }
    },

    {
      /**
        Returns a filtered DAO that skips the given number of items
        on a select()
      */
      name: 'skip',
      code: function skip(/* Number */ s) {
        return this.SkipDAO.create({
          delegate: this,
          skip_: s
        });
      }
    },

    {
      /**
        Returns a filtered DAO that stops producing items after the
        given count on a select().
      */
      name: 'limit',
      code: function limit(/* Number */ l) {
        return this.LimitedDAO.create({
          delegate: this,
          limit_: l
        });
      }
    },

    function put(obj) {
      return this.put_(this.__context__, obj);
    },

    /**
      Selects the contents of this DAO into a sink, then listens to keep
      the sink up to date. Returns a promise that resolves with the subscription.
      TODO: This will probably miss events that happen during the select but before the
      listen call.  We should check if this is the case and fix it if so.
    */
    function pipe(sink) {//, skip, limit, order, predicate) {
      this.pipe_(this.__context__, sink, undefined);
    },

    function pipe_(x, sink, predicate) {
      var dao = this;

      var sink = this.PipeSink.create({
        delegate: sink,
        dao: this
      });

      var sub = this.listen(sink); //, skip, limit, order, predicate);
      sink.reset();

      return sub;
    },

    function listen(sink) {
      if ( ! foam.core.FObject.isInstance(sink) ) {
        sink = foam.dao.AnonymousSink.create({ sink: sink }, this);
      }

      return this.listen_(this.__context__, sink, undefined);
    },

    /**
      Keeps the given sink up to date with changes to this DAO.
    */
    function listen_(x, sink, predicate) {
      var mySink = this.decorateListener_(sink, predicate);

      var sub = foam.core.FObject.create();

      sub.onDetach(this.on.sub(function(s, on, e, obj) {
        switch(e) {
          case 'put':
            mySink.put(obj, sub);
            break;
          case 'remove':
            mySink.remove(obj, sub);
            break;
          case 'reset':
            mySink.reset(sub);
            break;
        }
      }));

      return sub;
    },

    function decorateListener_(sink, predicate) {
      if ( predicate ) {
        return this.ResetListener.create({ delegate: sink });
      }

      return sink;
    },

    /**
      Used by DAO implementations to apply filters to a sink, often in a
      select() or removeAll() implementation.
      @private
    */
    function decorateSink_(sink, skip, limit, order, predicate) {
      if ( limit != undefined ) {
        sink = this.LimitedSink.create({
          limit: limit,
          delegate: sink
        });
      }

      if ( skip != undefined ) {
        sink = this.SkipSink.create({
          skip: skip,
          delegate: sink
        });
      }

      if ( order != undefined ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      if ( predicate != undefined ) {
        sink = this.PredicatedSink.create({
          predicate: predicate.partialEval ?
            predicate.partialEval() :
            predicate,
          delegate: sink
        });
      }

      return sink;
    },

    function remove(obj) {
      return this.remove_(this.__context__, obj);
    },

    function removeAll() {
      return this.removeAll_(this.__context__, undefined, undefined, undefined, undefined);
    },

    function compareTo(other) {
      if ( ! other ) return 1;
      return this === other ? 0 : foam.util.compare(this.$UID, other.$UID);
    },

    function select(sink) {
      return this.select_(this.__context__, sink, undefined, undefined, undefined, undefined);
    },

    function find(id) {
      return this.find_(this.__context__, id);
    },

    function cmd_(x, obj) {
      return undefined;
    },

    function cmd(obj) {
      return this.cmd_(this.__context__, obj);
    },

    // Placeholder functions to that selecting from DAO to DAO works.
    /** @private */
    function eof() {},

    /** @private */
    function reset() {}
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'InternalException',
  implements: ['foam.core.Exception']
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ExternalException',
  implements: ['foam.core.Exception']
})


foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      name: 'predicate',
      required: true
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      }
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      topics: [ 'on' ], // TODO: Remove this when all users of it are updated.
      forwards: [ 'put_', 'remove_', 'find_', 'select_', 'removeAll_', 'cmd_' ]
    }
  ],

  methods: [
    function find_(x, key) {
      var predicate = this.predicate;
      return this.delegate.find_(x, key).then(function(o) {
        return predicate.f(o) ? o : null;
      });
    },

    function select_(x, sink, skip, limit, order, predicate) {
      return this.delegate.select_(
        x, sink, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(
        x, skip, limit, order,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    },

    function listen_(x, sink, predicate) {
      return this.delegate.listen_(
        x, sink,
        predicate ?
          this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'OrderedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'comparator'
    }
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      return this.delegate.select_(x, sink, skip, limit, order || this.comparator, predicate);
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(x, skip, limit, order || this.comparator, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'skip_'
    }
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      return this.delegate.select_(x, sink, this.skip_, limit, order, predicate);
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(x, this.skip_, limit, order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LimitedDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'limit_'
    }
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      return this.delegate.select_(
        x, sink, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    },

    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(
        x, skip,
        limit !== undefined ? Math.min(this.limit_, limit) : this.limit_,
        order, predicate);
    }
  ]
});
